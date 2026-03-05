import { PhotoPreviewController } from '../../../controllers/photoPreviewController.js';
import { EventCapturePipeline } from '../../../events/eventCapturePipeline.js';
import { getPhotoSource, isPhotoLikeField } from '../../../utils/fieldGuards.js';
import { InputNode } from '../../nodes/inputNode.js';

export class PhotoPreviewFeature {
  constructor({ engine, context, fields }) {
    this.engine = engine;
    this.context = context;
    this.fields = fields;
    this.captureDisposers = new WeakMap();

    this.controller = new PhotoPreviewController({
      context: this.context,
      getFieldById: (fieldId) => this.getFieldById(fieldId)
    });
  }

  attach() {
    this.bindPhotoPreviewSelectionHandlers();
    this.bindPhotoPreviewHandlers();
  }

  detach() {
    const container = this.engine?.regions?.formContainer;
    if (!container) return;

    const disposeCapture = this.captureDisposers.get(container);
    disposeCapture?.();
    this.captureDisposers.delete(container);
  }

  isPhotoLikeField(field) {
    return isPhotoLikeField(field);
  }

  getPhotoSource(field) {
    return getPhotoSource(field);
  }

  getFieldById(fieldId) {
    if (!fieldId) return null;
    return (this.fields || []).find((field) => field?.id === fieldId) ?? null;
  }

  commitBrightness(fieldId) {
    this.controller.commitBrightness(fieldId);
  }

  bindPhotoPreviewHandlers() {
    const entries = this.fields.filter((field) => this.isPhotoLikeField(field));

    this.controller.bindPhotoFields(entries, {
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field)
    });
  }

  bindPhotoPreviewSelectionHandlers() {
    const container = this.engine?.regions?.formContainer;
    if (!container) return;
    if (this.captureDisposers.has(container)) return;

    const pipeline = EventCapturePipeline.forContainer(container);
    if (!pipeline) return;

    const disposeCapture = pipeline.use((event) => {
      const fieldId = this.resolvePhotoFieldIdFromNode(event.target);
      if (!fieldId) return false;

      this.controller.showBrightnessControl(fieldId);
      this.focusFieldInputForEditing(fieldId);
      return false;
    }, {
      types: ['mousedown', 'click'],
      priority: 20
    });

    this.captureDisposers.set(container, disposeCapture);
  }

  resolvePhotoFieldIdFromNode(node) {
    const fieldIds = new Set((this.fields || []).map((field) => field.id));
    let current = node;

    while (current) {
      const id = current.id;
      if (typeof id === 'string' && id.startsWith('photo-preview-')) {
        const parsed = id.slice('photo-preview-'.length);
        if (fieldIds.has(parsed)) return parsed;
      }
      current = current.parent;
    }

    return null;
  }

  focusFieldInputForEditing(fieldId) {
    if (!fieldId) return;

    const activate = () => {
      const node = this.context?.fieldRegistry?.get(fieldId);
      if (!(node instanceof InputNode) || node.editable === false) return;

      this.context?.focusManager?.focus?.(node);
      this.context?.textEditorController?.startEditing?.(node);
      this.engine?.rootNode?.invalidate?.();
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(activate);
      return;
    }

    setTimeout(activate, 0);
  }
}
