import { SceneHitTestSystem } from '../events/sceneHitTestSystem.js';

export class FormReorderController {
  constructor({ context, getRootNode, resolveFieldIdFromNode, onReorder, onPreviewTargetChange, onDragStateChange, dragThreshold = 8 }) {
    this.context = context;
    this.getRootNode = getRootNode;
    this.resolveFieldIdFromNode = resolveFieldIdFromNode;
    this.onReorder = onReorder;
    this.onPreviewTargetChange = onPreviewTargetChange;
    this.onDragStateChange = onDragStateChange;
    this.dragThreshold = dragThreshold;
    this.dragThresholdTouch = Math.max(12, dragThreshold + 4);
    this.previewSwitchThresholdMouse = 2;
    this.previewSwitchThresholdTouch = 4;
    this.listenerOptions = { passive: false };
    this.previousTouchAction = null;
    this.activePointerType = 'mouse';
    this.moveRafId = null;
    this.pendingMovePoint = null;
    this.dragCanvas = null;

    this.hitTestSystem = new SceneHitTestSystem();
    this.state = {
      phase: 'idle',
      startClientX: 0,
      startClientY: 0,
      lastPreviewClientX: 0,
      lastPreviewClientY: 0,
      previewFieldId: null,
      sourceFieldId: null,
      pointerId: null
    };

    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundPointerCancel = this.handlePointerCancel.bind(this);

    this.pointerDownAttached = false;
    this.dragListenersAttached = false;
  }

  getCanvas() {
    return this.context?.canvas ?? this.context?.canvasManager?.layers?.main?.canvas ?? null;
  }

  attach() {
    if (this.pointerDownAttached) return;
    const canvas = this.getCanvas();
    if (!canvas) return;
    canvas.addEventListener('pointerdown', this.boundPointerDown, this.listenerOptions);
    this.pointerDownAttached = true;
  }

  detach() {
    this.detachDragListeners();

    if (!this.pointerDownAttached) {
      this.resetState();
      return;
    }

    const canvas = this.getCanvas();
    if (canvas) {
      canvas.removeEventListener('pointerdown', this.boundPointerDown, this.listenerOptions);
    }

    this.pointerDownAttached = false;
    this.resetState();
  }

  attachDragListeners(pointerId) {
    if (this.dragListenersAttached) return;
    const canvas = this.getCanvas();
    if (!canvas) return;
    this.dragCanvas = canvas;

    this.state.pointerId = pointerId;
    canvas.addEventListener('pointermove', this.boundPointerMove, this.listenerOptions);
    canvas.addEventListener('pointerup', this.boundPointerUp, this.listenerOptions);
    canvas.addEventListener('pointercancel', this.boundPointerCancel, this.listenerOptions);

    if (this.previousTouchAction === null) {
      this.previousTouchAction = canvas.style.touchAction || '';
    }
    canvas.style.touchAction = 'none';

    if (pointerId !== null && pointerId !== undefined && canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(pointerId);
      } catch (_) {
      }
    }

    this.dragListenersAttached = true;
  }

  detachDragListeners() {
    if (!this.dragListenersAttached) return;
    const canvas = this.dragCanvas ?? this.getCanvas();

    const { pointerId } = this.state;
    if (canvas) {
      canvas.removeEventListener('pointermove', this.boundPointerMove, this.listenerOptions);
      canvas.removeEventListener('pointerup', this.boundPointerUp, this.listenerOptions);
      canvas.removeEventListener('pointercancel', this.boundPointerCancel, this.listenerOptions);
    }

    if (canvas && this.previousTouchAction !== null) {
      canvas.style.touchAction = this.previousTouchAction;
    }
    this.previousTouchAction = null;

    if (canvas && pointerId !== null && pointerId !== undefined && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(pointerId);
      } catch (_) {
      }
    }

    if (this.moveRafId !== null) {
      cancelAnimationFrame(this.moveRafId);
      this.moveRafId = null;
    }
    this.pendingMovePoint = null;
    this.dragCanvas = null;

    this.dragListenersAttached = false;
  }

  resetState() {
    this.state = {
      phase: 'idle',
      startClientX: 0,
      startClientY: 0,
      lastPreviewClientX: 0,
      lastPreviewClientY: 0,
      previewFieldId: null,
      sourceFieldId: null,
      pointerId: null
    };
  }

  updatePreviewTarget(fieldId) {
    this.onPreviewTargetChange?.(fieldId ?? null);
  }

  notifyDragState(partialState) {
    this.onDragStateChange?.({ ...partialState });
  }

  getDragThreshold() {
    return this.activePointerType === 'touch' || this.activePointerType === 'pen'
      ? this.dragThresholdTouch
      : this.dragThreshold;
  }

  getPreviewSwitchThreshold() {
    return this.activePointerType === 'touch' || this.activePointerType === 'pen'
      ? this.previewSwitchThresholdTouch
      : this.previewSwitchThresholdMouse;
  }

  handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const sourceFieldId = this.getDragHandleFieldIdAtClientPosition(event.clientX, event.clientY);
    if (!sourceFieldId) return;

    this.state = {
      phase: 'pending',
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastPreviewClientX: event.clientX,
      lastPreviewClientY: event.clientY,
      previewFieldId: null,
      sourceFieldId,
      pointerId: event.pointerId
    };
    this.activePointerType = event.pointerType || 'mouse';

    this.notifyDragState({ active: false, phase: 'pending', sourceFieldId, pointerId: event.pointerId });

    this.attachDragListeners(event.pointerId);
    event.preventDefault();
  }

  handlePointerMove(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;
    if (this.state.phase === 'idle') return;

    const deltaX = event.clientX - this.state.startClientX;
    const deltaY = event.clientY - this.state.startClientY;
    const distancePx = Math.hypot(deltaX, deltaY);
    if (this.state.phase === 'pending' && distancePx >= this.getDragThreshold()) {
      this.state.phase = 'dragging';
      this.notifyDragState({ active: true, phase: 'dragging', sourceFieldId: this.state.sourceFieldId, pointerId: this.state.pointerId });
    }

    if (this.state.phase === 'dragging') {
      this.pendingMovePoint = { clientX: event.clientX, clientY: event.clientY };
      if (this.moveRafId === null) {
        this.moveRafId = requestAnimationFrame(() => this.processMoveFrame());
      }
      event.preventDefault();
    }
  }

  processMoveFrame() {
    this.moveRafId = null;
    if (this.state.phase !== 'dragging') {
      this.pendingMovePoint = null;
      return;
    }

    const movePoint = this.pendingMovePoint;
    if (!movePoint) return;
    this.pendingMovePoint = null;

      const previewFieldId = this.getFieldIdAtClientPosition(movePoint.clientX, movePoint.clientY);
      const nextPreviewFieldId = previewFieldId ?? null;
      const targetChanged = nextPreviewFieldId !== this.state.previewFieldId;
      if (!targetChanged) return;

      const previewDeltaX = movePoint.clientX - this.state.lastPreviewClientX;
      const previewDeltaY = movePoint.clientY - this.state.lastPreviewClientY;
      const previewDistancePx = Math.hypot(previewDeltaX, previewDeltaY);
      if (previewDistancePx < this.getPreviewSwitchThreshold()) return;

      this.state.previewFieldId = nextPreviewFieldId;
      this.state.lastPreviewClientX = movePoint.clientX;
      this.state.lastPreviewClientY = movePoint.clientY;
      this.updatePreviewTarget(nextPreviewFieldId);
  }

  handlePointerUp(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;

    const { phase, sourceFieldId } = this.state;
    if (phase === 'idle' || !sourceFieldId) {
      this.detachDragListeners();
      this.resetState();
      return;
    }

    if (phase === 'dragging') {
      const dropFieldId = this.getFieldIdAtClientPosition(event.clientX, event.clientY);
      this.onReorder?.(sourceFieldId, dropFieldId);
      event.preventDefault();
    }

    this.state.previewFieldId = null;
    this.state.phase = 'idle';
    this.activePointerType = 'mouse';
    this.updatePreviewTarget(null);
    this.notifyDragState({ active: false, phase: 'idle', sourceFieldId: null, pointerId: null });

    this.detachDragListeners();
    this.resetState();
  }

  handlePointerCancel(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;
    this.state.previewFieldId = null;
    this.state.phase = 'idle';
    this.activePointerType = 'mouse';
    this.updatePreviewTarget(null);
    this.notifyDragState({ active: false, phase: 'idle', sourceFieldId: null, pointerId: null });
    this.detachDragListeners();
    this.resetState();
  }

  clientToScene(clientX, clientY) {
    const canvas = this.getCanvas();
    const pipeline = this.context?.pipeline;
    if (!canvas || !pipeline) return null;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    return pipeline.toSceneCoords(canvasX, canvasY);
  }

  getHitNodeAtClientPosition(clientX, clientY) {
    const rootNode = this.getRootNode?.();
    if (!rootNode) return null;

    const scenePoint = this.clientToScene(clientX, clientY);
    if (!scenePoint) return null;

    return this.hitTestSystem.hitTest(rootNode, scenePoint.x, scenePoint.y, this.context?.ctx);
  }

  getDragHandleFieldIdAtClientPosition(clientX, clientY) {
    const hitNode = this.getHitNodeAtClientPosition(clientX, clientY);
    let current = hitNode;

    while (current) {
      const id = current.id;
      if (typeof id === 'string' && id.startsWith('drag-handle-')) {
        return id.slice('drag-handle-'.length);
      }
      current = current.parent;
    }

    return null;
  }

  getFieldIdAtClientPosition(clientX, clientY) {
    const hitNode = this.getHitNodeAtClientPosition(clientX, clientY);
    return this.resolveFieldIdFromNode?.(hitNode, {
      allowDeleteNode: true,
      allowHandleNode: true
    }) ?? null;
  }
}
