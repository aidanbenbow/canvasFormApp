import { TextNode } from '../components/nodes/textNode.js';
import { ACTIONS } from '../events/actions.js';

export class PhotoPreviewController {
  constructor({ context, onBrightnessCommitted, getFieldById } = {}) {
    this.context = context;
    this.onBrightnessCommitted = onBrightnessCommitted;
    this.getFieldById = getFieldById;
    this.boundFieldSnapshotById = new Map();
    this.pendingBrightnessByFieldId = new Map();
    this.visibleBrightnessControls = new Set();
    this.inputOnChangeBindings = new WeakMap();
    this.sliderOnChangeBindings = new WeakMap();
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
    const pendingBrightness = this.normalizeBrightness(
      this.pendingBrightnessByFieldId.get(fieldId) ?? this.getPreviewNode(fieldId)?.brightness ?? 100
    );

    this.pendingBrightnessByFieldId.set(fieldId, pendingBrightness);
    if (!sliderNode) return;

    sliderNode.setValue?.(pendingBrightness, { silent: true });
    sliderNode.visible = true;
    sliderNode.hitTestable = true;
    sliderNode.invalidate?.();

    if (saveButtonNode) {
      saveButtonNode.label = 'Save Brightness';
      saveButtonNode.visible = true;
      saveButtonNode.hitTestable = true;
      saveButtonNode.invalidate?.();
    }
  }

  commitBrightness(fieldId) {
    if (!fieldId) return;

    const field = this.resolveFieldById(fieldId);
    if (!field) return;

    const pendingBrightness = this.resolveBrightnessForCommit(fieldId, field);

    field.brightness = pendingBrightness;
    this.pendingBrightnessByFieldId.set(fieldId, pendingBrightness);

    const previewNode = this.getPreviewNode(fieldId);
    previewNode?.setBrightness?.(pendingBrightness);

    const brightnessNode = this.getBrightnessNode(fieldId);
    brightnessNode?.setValue?.(pendingBrightness, { silent: true });

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

    this.boundFieldSnapshotById = new Map();
    const activeFieldIds = new Set();

    for (const field of fields) {
      if (!field || !isPhotoLikeField?.(field)) continue;

      this.boundFieldSnapshotById.set(field.id, field);
      activeFieldIds.add(field.id);

      const inputNode = this.context?.fieldRegistry?.get(field.id);
      const previewNode = this.getPreviewNode(field.id);
      const brightnessNode = this.getBrightnessNode(field.id);
      const saveButtonNode = this.getBrightnessSaveButtonNode(field.id);
      if (!inputNode || !previewNode) continue;

      this.bindPhotoInput(field, inputNode, previewNode, getPhotoSource);
      this.bindBrightness(field, previewNode, brightnessNode, saveButtonNode);
    }

    for (const fieldId of this.pendingBrightnessByFieldId.keys()) {
      if (!activeFieldIds.has(fieldId)) {
        this.pendingBrightnessByFieldId.delete(fieldId);
      }
    }
  }

  bindPhotoInput(field, inputNode, previewNode, getPhotoSource) {
    if (!field || !inputNode || !previewNode) return;

    let onChangeBinding = this.inputOnChangeBindings.get(inputNode);
    if (!onChangeBinding) {
      onChangeBinding = {
        fieldId: field.id,
        originalOnChange: inputNode.onChange,
        wrappedOnChange: null
      };

      onChangeBinding.wrappedOnChange = (value) => {
        onChangeBinding.originalOnChange?.(value);
        this.updatePreviewForField(onChangeBinding.fieldId, value);
      };

      this.inputOnChangeBindings.set(inputNode, onChangeBinding);
    }

    onChangeBinding.fieldId = field.id;
    inputNode.onChange = onChangeBinding.wrappedOnChange;

    const initialValue = inputNode.getValue?.() ?? inputNode.value ?? getPhotoSource?.(field) ?? '';
    this.updatePreviewForField(field.id, initialValue);
  }

  bindBrightness(field, previewNode, brightnessNode, saveButtonNode) {
    if (!field || !previewNode) return;

    const hasPending = this.pendingBrightnessByFieldId.has(field.id);
    const initialBrightness = hasPending
      ? this.normalizeBrightness(this.pendingBrightnessByFieldId.get(field.id))
      : this.normalizeBrightness(field?.brightness ?? previewNode?.brightness ?? 100);

    previewNode.setBrightness?.(initialBrightness);
    this.pendingBrightnessByFieldId.set(field.id, initialBrightness);

    const shouldShowControls = this.visibleBrightnessControls.has(field.id);

    if (brightnessNode) {
      brightnessNode.visible = shouldShowControls;
      brightnessNode.hitTestable = shouldShowControls;
      brightnessNode.setValue?.(initialBrightness, { silent: true });

      let sliderBinding = this.sliderOnChangeBindings.get(brightnessNode);
      if (!sliderBinding) {
        sliderBinding = {
          fieldId: field.id,
          originalOnChange: brightnessNode.onChange,
          wrappedOnChange: null
        };

        sliderBinding.wrappedOnChange = (nextBrightness) => {
          sliderBinding.originalOnChange?.(nextBrightness);
          const normalizedBrightness = this.normalizeBrightness(nextBrightness);
          this.pendingBrightnessByFieldId.set(sliderBinding.fieldId, normalizedBrightness);
          this.getPreviewNode(sliderBinding.fieldId)?.setBrightness?.(normalizedBrightness);

          const saveNode = this.getBrightnessSaveButtonNode(sliderBinding.fieldId);
          if (saveNode && saveNode.label !== 'Save Brightness') {
            saveNode.label = 'Save Brightness';
            saveNode.invalidate?.();
          }
        };

        this.sliderOnChangeBindings.set(brightnessNode, sliderBinding);
      }

      sliderBinding.fieldId = field.id;
      brightnessNode.onChange = sliderBinding.wrappedOnChange;
    }

    if (saveButtonNode) {
      saveButtonNode.visible = shouldShowControls;
      saveButtonNode.hitTestable = shouldShowControls;
      saveButtonNode.label = 'Save Brightness';
      saveButtonNode.onClick = () => {
        this.commitBrightness(field.id);
      };
    }
  }

  normalizeBrightness(value) {
    const raw = Number(value);
    if (!Number.isFinite(raw)) return 100;
    return Math.max(0, Math.min(300, raw));
  }

  resolveBrightnessForCommit(fieldId, field) {
    const hasPending = this.pendingBrightnessByFieldId.has(fieldId);
    if (hasPending) {
      return this.normalizeBrightness(this.pendingBrightnessByFieldId.get(fieldId));
    }

    const fromField = this.normalizeBrightness(field?.brightness);
    if (Number.isFinite(Number(field?.brightness))) {
      return fromField;
    }

    const fromPreview = this.normalizeBrightness(this.getPreviewNode(fieldId)?.brightness);
    if (Number.isFinite(Number(this.getPreviewNode(fieldId)?.brightness))) {
      return fromPreview;
    }

    return 100;
  }

  resolveFieldById(fieldId) {
    if (!fieldId) return null;

    const resolved = this.getFieldById?.(fieldId);
    if (resolved) return resolved;

    return this.boundFieldSnapshotById.get(fieldId) ?? null;
  }
}