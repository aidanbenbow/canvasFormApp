import { EventCapturePipeline } from '../../../events/eventCapturePipeline.js';

export class PhotoPreviewFeature {
  constructor({ getContainer, getFields, getFieldById, interactionController, photoAdjustmentFeature }) {
    this.getContainer = getContainer;
    this.getFields = getFields;
    this.getFieldById = getFieldById;
    this.interactionController = interactionController;
    this.photoAdjustmentFeature = photoAdjustmentFeature;
    this.captureDisposers = new WeakMap();
  }

  attach() {
    const fields = this.getFields?.() || [];
    this.photoAdjustmentFeature?.bind?.(fields);

    const container = this.getContainer?.();
    if (!container) return;
    if (this.captureDisposers.has(container)) return;

    const pipeline = EventCapturePipeline.forContainer(container);
    if (!pipeline) return;

    const disposeCapture = pipeline.use((event) => {
      const fieldId = this.resolvePhotoFieldIdFromNode(event.target);
      if (!fieldId) return false;

      this.interactionController?.setSelectedField?.(fieldId);
      this.photoAdjustmentFeature?.onPhotoPreviewSelected?.(fieldId);
      return false;
    }, {
      types: ['mousedown', 'click'],
      priority: 20
    });

    this.captureDisposers.set(container, disposeCapture);
  }

  detach() {
    const container = this.getContainer?.();
    if (!container) return;

    const disposeCapture = this.captureDisposers.get(container);
    disposeCapture?.();
    this.captureDisposers.delete(container);
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