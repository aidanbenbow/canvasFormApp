export class PhotoPreviewFeature {
  constructor({ getContainer, getFields, getFieldById, interactionController, photoAdjustmentFeature }) {
    this.getContainer = getContainer;
    this.getFields = getFields;
    this.getFieldById = getFieldById;
    this.interactionController = interactionController;
    this.photoAdjustmentFeature = photoAdjustmentFeature;
    this.captureBindings = new WeakMap();
  }

  attach() {
    const fields = this.getFields?.() || [];
    this.photoAdjustmentFeature?.bind?.(fields);

    const container = this.getContainer?.();
    if (!container) return;

    let captureBinding = this.captureBindings.get(container);
    if (!captureBinding) {
      captureBinding = {
        previousCapture: container.onEventCapture?.bind(container) ?? null,
        wrappedCapture: null
      };

      captureBinding.wrappedCapture = (event) => {
        const handledByPrevious = captureBinding.previousCapture?.(event);
        if (handledByPrevious) return true;

        if (event.type !== 'mousedown' && event.type !== 'click') {
          return false;
        }

        const fieldId = this.resolvePhotoFieldIdFromNode(event.target);
        if (!fieldId) return false;

        this.interactionController?.setSelectedField?.(fieldId);
        this.photoAdjustmentFeature?.onPhotoPreviewSelected?.(fieldId);
        return false;
      };

      this.captureBindings.set(container, captureBinding);
      container.onEventCapture = captureBinding.wrappedCapture;
      return;
    }

    if (container.onEventCapture !== captureBinding.wrappedCapture) {
      captureBinding.previousCapture = container.onEventCapture?.bind(container) ?? captureBinding.previousCapture;
    }

    container.onEventCapture = captureBinding.wrappedCapture;
  }

  detach() {
    const container = this.getContainer?.();
    if (!container) return;

    const captureBinding = this.captureBindings.get(container);
    if (!captureBinding) return;

    container.onEventCapture = captureBinding.previousCapture;
    this.captureBindings.delete(container);
  }

  resolvePhotoFieldIdFromNode(node) {
    let current = node;

    while (current) {
      const id = current.id;
      if (typeof id === 'string' && id.startsWith('photo-preview-')) {
        const parsed = id.slice('photo-preview-'.length);
        if (this.getFieldById?.(parsed)) {
          return parsed;
        }
      }
      current = current.parent;
    }

    return null;
  }
}