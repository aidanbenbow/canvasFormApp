import { SceneHitTestSystem } from '../events/sceneHitTestSystem.js';

export class FormReorderController {
  constructor({ context, getRootNode, resolveFieldIdFromNode, onReorder, onPreviewTargetChange, dragThreshold = 8 }) {
    this.context = context;
    this.getRootNode = getRootNode;
    this.resolveFieldIdFromNode = resolveFieldIdFromNode;
    this.onReorder = onReorder;
    this.onPreviewTargetChange = onPreviewTargetChange;
    this.dragThreshold = dragThreshold;

    this.hitTestSystem = new SceneHitTestSystem();
    this.state = {
      pending: false,
      active: false,
      startY: 0,
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
    canvas.addEventListener('pointerdown', this.boundPointerDown);
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
      canvas.removeEventListener('pointerdown', this.boundPointerDown);
    }

    this.pointerDownAttached = false;
    this.resetState();
  }

  attachDragListeners(pointerId) {
    if (this.dragListenersAttached) return;
    const canvas = this.getCanvas();
    if (!canvas) return;

    this.state.pointerId = pointerId;
    canvas.addEventListener('pointermove', this.boundPointerMove);
    canvas.addEventListener('pointerup', this.boundPointerUp);
    canvas.addEventListener('pointercancel', this.boundPointerCancel);

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
    const canvas = this.getCanvas();
    if (!canvas) return;

    const { pointerId } = this.state;
    canvas.removeEventListener('pointermove', this.boundPointerMove);
    canvas.removeEventListener('pointerup', this.boundPointerUp);
    canvas.removeEventListener('pointercancel', this.boundPointerCancel);

    if (pointerId !== null && pointerId !== undefined && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(pointerId);
      } catch (_) {
      }
    }

    this.dragListenersAttached = false;
  }

  resetState() {
    this.state = {
      pending: false,
      active: false,
      startY: 0,
      sourceFieldId: null,
      pointerId: null
    };
  }

  updatePreviewTarget(fieldId) {
    this.onPreviewTargetChange?.(fieldId ?? null);
  }

  handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const sourceFieldId = this.getDragHandleFieldIdAtClientPosition(event.clientX, event.clientY);
    if (!sourceFieldId) return;

    const scenePoint = this.clientToScene(event.clientX, event.clientY);
    if (!scenePoint) return;

    this.state = {
      pending: true,
      active: false,
      startY: scenePoint.y,
      sourceFieldId,
      pointerId: event.pointerId
    };

    this.attachDragListeners(event.pointerId);
    event.preventDefault();
  }

  handlePointerMove(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;
    if (!this.state.pending) return;

    const scenePoint = this.clientToScene(event.clientX, event.clientY);
    if (!scenePoint) return;

    const deltaY = Math.abs(scenePoint.y - this.state.startY);
    if (!this.state.active && deltaY >= this.dragThreshold) {
      this.state.active = true;
    }

    if (this.state.active) {
      const previewFieldId = this.getFieldIdAtClientPosition(event.clientX, event.clientY);
      this.updatePreviewTarget(previewFieldId);
      event.preventDefault();
    }
  }

  handlePointerUp(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;

    const { pending, active, sourceFieldId } = this.state;
    if (!pending || !sourceFieldId) {
      this.detachDragListeners();
      this.resetState();
      return;
    }

    if (active) {
      const dropFieldId = this.getFieldIdAtClientPosition(event.clientX, event.clientY);
      this.onReorder?.(sourceFieldId, dropFieldId);
      event.preventDefault();
    }

    this.updatePreviewTarget(null);

    this.detachDragListeners();
    this.resetState();
  }

  handlePointerCancel(event) {
    if (this.state.pointerId !== null && event.pointerId !== this.state.pointerId) return;
    this.updatePreviewTarget(null);
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
