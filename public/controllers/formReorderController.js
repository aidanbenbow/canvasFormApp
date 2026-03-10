import { SceneHitTestSystem } from '../events/sceneHitTestSystem.js';
import { EventCapturePipeline } from '../events/eventCapturePipeline.js';

export class FormReorderController {
  constructor({
    context,
    getContainer,
    getRootNode,
    resolveFieldGroupIdFromNode,
    getSelectedFieldId,
    onSelectField,
    hitTestSystem,
    onReorder,
    onPreviewTargetChange,
    onDragStateChange,
    dragThreshold = 8
  }) {
    this.context = context;
    this.getContainer = getContainer;
    this.getRootNode = getRootNode;
    this.resolveFieldGroupIdFromNode = resolveFieldGroupIdFromNode;
    this.getSelectedFieldId = getSelectedFieldId;
    this.onSelectField = onSelectField;
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

    this.hitTestSystem = hitTestSystem || new SceneHitTestSystem();
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
    this.captureDispose = null;
  }

  getCanvas() {
    return this.context?.canvas ?? this.context?.canvasManager?.layers?.main?.canvas ?? null;
  }

  attach() {
    if (this.captureDispose || this.pointerDownAttached) return;

    const container = this.getContainer?.();
    const eventCapturePipeline = EventCapturePipeline.forContainer(container);
    if (eventCapturePipeline) {
      this.captureDispose = eventCapturePipeline.use((sceneEvent) => {
        return this.handleCapturePointerDown(sceneEvent);
      }, {
        types: ['mousedown'],
        priority: 40
      });
      return;
    }

    const canvas = this.getCanvas();
    if (!canvas) return;
    canvas.addEventListener('pointerdown', this.boundPointerDown, this.listenerOptions);
    this.pointerDownAttached = true;
  }

  detach() {
    this.detachDragListeners();

    this.captureDispose?.();
    this.captureDispose = null;

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

  handleCapturePointerDown(sceneEvent) {
    const originalEvent = sceneEvent?.originalEvent;
    const clientPoint = this.getClientPointFromOriginalEvent(originalEvent);
    if (!clientPoint) return false;

    const sourceFieldId = this.resolveFieldGroupIdFromNode?.(sceneEvent?.target) ?? null;
    if (!sourceFieldId) return false;

    const selectedFieldId = this.getSelectedFieldId?.() ?? null;
    if (sourceFieldId !== selectedFieldId) {
      this.onSelectField?.(sourceFieldId);
      return false;
    }

    this.startPendingDrag({
      sourceFieldId,
      clientX: clientPoint.clientX,
      clientY: clientPoint.clientY,
      pointerId: originalEvent?.pointerId ?? null,
      pointerType: originalEvent?.pointerType || 'mouse'
    });

    originalEvent?.preventDefault?.();
    sceneEvent?.stopPropagation?.();
    return true;
  }

  getClientPointFromOriginalEvent(originalEvent) {
    if (!originalEvent) return null;

    if (Number.isFinite(originalEvent.clientX) && Number.isFinite(originalEvent.clientY)) {
      return { clientX: originalEvent.clientX, clientY: originalEvent.clientY };
    }

    const touch = originalEvent.touches?.[0] || originalEvent.changedTouches?.[0];
    if (touch && Number.isFinite(touch.clientX) && Number.isFinite(touch.clientY)) {
      return { clientX: touch.clientX, clientY: touch.clientY };
    }

    return null;
  }

  startPendingDrag({ sourceFieldId, clientX, clientY, pointerId, pointerType = 'mouse' }) {
    if (!sourceFieldId) return;

    this.state = {
      phase: 'pending',
      startClientX: clientX,
      startClientY: clientY,
      lastPreviewClientX: clientX,
      lastPreviewClientY: clientY,
      previewFieldId: null,
      sourceFieldId,
      pointerId: pointerId ?? null
    };
    this.activePointerType = pointerType;

    this.notifyDragState({
      active: false,
      phase: 'pending',
      sourceFieldId,
      pointerId: pointerId ?? null
    });

    this.attachDragListeners(pointerId ?? null);
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

    const sourceFieldId = this.getFieldGroupIdAtClientPosition(event.clientX, event.clientY);
    if (!sourceFieldId) return;

    const selectedFieldId = this.getSelectedFieldId?.() ?? null;
    if (sourceFieldId !== selectedFieldId) {
      this.onSelectField?.(sourceFieldId);
      return;
    }

    this.startPendingDrag({
      sourceFieldId,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      pointerType: event.pointerType || 'mouse'
    });
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
      this.state.previewFieldId = null;
      this.state.lastPreviewClientX = event.clientX;
      this.state.lastPreviewClientY = event.clientY;
      this.updatePreviewTarget(null);
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

      const previewFieldId = this.getFieldGroupIdAtClientPosition(movePoint.clientX, movePoint.clientY);
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
      const dropFieldId = this.getFieldGroupIdAtClientPosition(event.clientX, event.clientY);
      if (dropFieldId && dropFieldId !== sourceFieldId) {
        this.onReorder?.(sourceFieldId, dropFieldId);
      }
      event.preventDefault();
    }

    this.state.previewFieldId = null;
    this.state.phase = 'idle';
    this.updatePreviewTarget(null);
    this.notifyDragState({ active: false, phase: 'idle', sourceFieldId: null, pointerId: null });

    this.detachDragListeners();
    this.resetState();
  }

  handlePointerCancel(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;
    this.state.previewFieldId = null;
    this.state.phase = 'idle';
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

  getFieldGroupIdAtClientPosition(clientX, clientY) {
    const hitNode = this.getHitNodeAtClientPosition(clientX, clientY);
    return this.resolveFieldGroupIdFromNode?.(hitNode) ?? null;
  }
}
