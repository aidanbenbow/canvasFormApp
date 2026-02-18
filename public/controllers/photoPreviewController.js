import { TextNode } from '../components/nodes/textNode.js';
import { ACTIONS } from '../events/actions.js';

export class PhotoPreviewController {
  constructor({ context, onBrightnessCommitted } = {}) {
    this.context = context;
    this.onBrightnessCommitted = onBrightnessCommitted;
    this.photoFieldRefs = new Map();
    this.pendingBrightnessByFieldId = new Map();
    this.visibleBrightnessControls = new Set();
  }

  getPreviewNode(fieldId) {
    if (!fieldId) return null;
    return this.context?.fieldRegistry?.get(`photo-preview-${fieldId}`) ?? null;
  }

  getBrightnessNode(fieldId) {
    if (!fieldId) return null;
    return this.context?.fieldRegistry?.get(`photo-brightness-${fieldId}`) ?? null;
  }

  getBrightnessSaveButtonNode(fieldId) {
    if (!fieldId) return null;
    return this.context?.fieldRegistry?.get(`photo-brightness-save-${fieldId}`) ?? null;
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
    if (!fieldId) return;
    this.visibleBrightnessControls.add(fieldId);

    const sliderNode = this.getBrightnessNode(fieldId);
    const saveButtonNode = this.getBrightnessSaveButtonNode(fieldId);
    if (!sliderNode) return;

    sliderNode.visible = true;
    sliderNode.hitTestable = true;
    sliderNode.invalidate?.();

    if (saveButtonNode) {
      saveButtonNode.visible = true;
      saveButtonNode.hitTestable = true;
      saveButtonNode.invalidate?.();
    }
  }

  commitBrightness(fieldId) {
    if (!fieldId) return;

    const field = this.photoFieldRefs.get(fieldId);
    if (!field) return;

    const pendingBrightness = Number(this.pendingBrightnessByFieldId.get(fieldId));
    if (!Number.isFinite(pendingBrightness)) return;

    field.brightness = pendingBrightness;
    const saveButtonNode = this.getBrightnessSaveButtonNode(fieldId);
    if (saveButtonNode) {
      saveButtonNode.label = 'Saved ✓';
      saveButtonNode.invalidate?.();
    }

    this.context?.pipeline?.invalidate?.();
    this.showBrightnessSavedToast();
    this.onBrightnessCommitted?.(fieldId, field, pendingBrightness);
  }

  showBrightnessSavedToast() {
    const toastLayer = this.context?.uiServices?.toastLayer;

    const node = new TextNode({
      id: `toast-brightness-${Date.now()}`,
      text: 'Brightness saved',
      style: {
        font: '30px sans-serif',
        color: '#ffffff',
        backgroundColor: '#0b8f3a',
        borderColor: '#06702c',
        paddingX: 22,
        paddingY: 14,
        radius: 10,
        align: 'center',
        shrinkToFit: true
      }
    });

    if (toastLayer) {
      toastLayer.showMessage(node, { timeoutMs: 1800 });
      return;
    }

    this.context?.dispatcher?.dispatch?.(ACTIONS.TOAST.SHOW, node);
  }

  bindPhotoFields(fields, { isPhotoLikeField, getPhotoSource } = {}) {
    if (!Array.isArray(fields)) return;

    this.photoFieldRefs = new Map();
    this.pendingBrightnessByFieldId = new Map();

    for (const field of fields) {
      if (!field || !isPhotoLikeField?.(field)) continue;

      this.photoFieldRefs.set(field.id, field);

      const inputNode = this.context?.fieldRegistry?.get(field.id);
      const previewNode = this.getPreviewNode(field.id);
      const brightnessNode = this.getBrightnessNode(field.id);
      const saveButtonNode = this.getBrightnessSaveButtonNode(field.id);
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
      this.pendingBrightnessByFieldId.set(field.id, initialBrightness);

      if (brightnessNode) {
        const shouldShowControls = this.visibleBrightnessControls.has(field.id);
        brightnessNode.visible = shouldShowControls;
        brightnessNode.hitTestable = shouldShowControls;
        brightnessNode.setValue?.(initialBrightness, { silent: true });
        brightnessNode.onChange = (nextBrightness) => {
          const normalizedBrightness = Number(nextBrightness);
          this.pendingBrightnessByFieldId.set(field.id, normalizedBrightness);
          previewNode.setBrightness?.(normalizedBrightness);
        };
      }

      if (saveButtonNode) {
        const shouldShowControls = this.visibleBrightnessControls.has(field.id);
        saveButtonNode.visible = shouldShowControls;
        saveButtonNode.hitTestable = shouldShowControls;
        saveButtonNode.label = 'Save Brightness';
        saveButtonNode.onClick = () => {
          this.commitBrightness(field.id);
        };
      }
    }
  }
}