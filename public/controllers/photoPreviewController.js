export class PhotoPreviewController {
  constructor({ context }) {
    this.context = context;
  }

  getPreviewNode(fieldId) {
    if (!fieldId) return null;
    return this.context?.fieldRegistry?.get(`photo-preview-${fieldId}`) ?? null;
  }

  getBrightnessNode(fieldId) {
    if (!fieldId) return null;
    return this.context?.fieldRegistry?.get(`photo-brightness-${fieldId}`) ?? null;
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

  showBrightnessControl(fieldId) {
    const sliderNode = this.getBrightnessNode(fieldId);
    if (!sliderNode) return;

    sliderNode.visible = true;
    sliderNode.hitTestable = true;
    sliderNode.invalidate?.();
  }

  bindPhotoFields(fields, { isPhotoLikeField, getPhotoSource } = {}) {
    if (!Array.isArray(fields)) return;

    for (const field of fields) {
      if (!field || !isPhotoLikeField?.(field)) continue;

      const inputNode = this.context?.fieldRegistry?.get(field.id);
      const previewNode = this.getPreviewNode(field.id);
      const brightnessNode = this.getBrightnessNode(field.id);
      if (!inputNode || !previewNode) continue;

      const previousOnChange = inputNode.onChange;
      inputNode.onChange = (value) => {
        previousOnChange?.(value);
        this.updatePreviewForField(field.id, value);
      };

      const initialValue = inputNode.getValue?.() ?? inputNode.value ?? getPhotoSource?.(field) ?? '';
      this.updatePreviewForField(field.id, initialValue);

      const initialBrightness = Number(field?.brightness ?? previewNode?.brightness ?? 100);
      previewNode.setBrightness?.(initialBrightness);

      if (brightnessNode) {
        brightnessNode.setValue?.(initialBrightness, { silent: true });
        brightnessNode.onChange = (nextBrightness) => {
          const normalizedBrightness = Number(nextBrightness);
          field.brightness = normalizedBrightness;
          previewNode.setBrightness?.(normalizedBrightness);
        };
      }
    }
  }
}