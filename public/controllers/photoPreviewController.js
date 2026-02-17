export class PhotoPreviewController {
  constructor({ context }) {
    this.context = context;
  }

  getPreviewNode(fieldId) {
    if (!fieldId) return null;
    return this.context?.fieldRegistry?.get(`photo-preview-${fieldId}`) ?? null;
  }

  updatePreviewForField(fieldId, source) {
    const previewNode = this.getPreviewNode(fieldId);
    if (!previewNode) return;

    if (typeof previewNode.setSource === 'function') {
      previewNode.setSource(source);
      return;
    }

    previewNode.src = String(source || '').trim();
    previewNode.loadImage?.();
    previewNode.invalidate?.();
  }

  bindPhotoFields(fields, { isPhotoLikeField, getPhotoSource } = {}) {
    if (!Array.isArray(fields)) return;

    for (const field of fields) {
      if (!field || !isPhotoLikeField?.(field)) continue;

      const inputNode = this.context?.fieldRegistry?.get(field.id);
      const previewNode = this.getPreviewNode(field.id);
      if (!inputNode || !previewNode) continue;

      const previousOnChange = inputNode.onChange;
      inputNode.onChange = (value) => {
        previousOnChange?.(value);
        this.updatePreviewForField(field.id, value);
      };

      const initialValue = inputNode.getValue?.() ?? inputNode.value ?? getPhotoSource?.(field) ?? '';
      this.updatePreviewForField(field.id, initialValue);
    }
  }
}