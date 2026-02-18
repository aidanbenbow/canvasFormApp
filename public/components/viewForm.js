import { ACTIONS } from "../events/actions.js";
import { CopyFieldController } from "../controllers/copyFieldController.js";
import { PhotoPreviewController } from "../controllers/photoPreviewController.js";
import { getPhotoSource, isCopyCandidateField, isPhotoLikeField } from "../utils/fieldGuards.js";
import { normalizeFields } from "../utils/normalizeFields.js";
import { buildViewFormManifest } from "./manifests/viewFormManifest.js";
import { getResponsiveViewport } from "./manifests/screenManifestUtils.js";
import { BaseScreen } from "./baseScreen.js";
import { InputNode } from "./nodes/inputNode.js";
import { compileUIManifest } from "./uiManifestCompiler.js";


export class FormViewScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, results, formId }) {
    super({ id: "form-view", context, dispatcher, eventBusManager });
    this.context = context;
    this.store = store;
    this.formId = formId ?? this.store.getActiveForm()?.id ?? null;
    this.formStructure = this.store.getActiveForm()?.formStructure || {};
    this.fields = normalizeFields(this.formStructure);
    this.commandRegistry = commandRegistry;
    this.captureBindings = new WeakMap();
    this.copyFieldController = new CopyFieldController({ context: this.context, commandRegistry: this.commandRegistry });
    this.photoPreviewController = new PhotoPreviewController({
      context: this.context,
      getFieldById: (fieldId) => this.getFieldById(fieldId)
    });
    this.saveBrightnessCommand = `${this.id}.saveBrightness`;
    this.commandRegistry.register(this.saveBrightnessCommand, ({ fieldId } = {}) => {
      this.photoPreviewController.commitBrightness(fieldId);
    });

    this.manifest = buildViewFormManifest({
      fields: this.fields,
      shouldAddCopyButton: (field) => this.shouldAddCopyButton(field),
      ensureCopyCommand: (fieldId) => this.ensureCopyCommand(fieldId),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      saveBrightnessAction: this.saveBrightnessCommand
    });
    this.factories = factories;
    this.onSubmit = onSubmit;
    this.results = results ?? (this.formId ? this.store.getFormResults(this.formId) : []);
  }

  getPhotoSource(field) {
    return getPhotoSource(field);
  }

  getFieldById(fieldId) {
    if (!fieldId) return null;
    return (this.fields || []).find((field) => field?.id === fieldId) ?? null;
  }

  isPhotoLikeField(field) {
    return isPhotoLikeField(field);
  }

  shouldAddCopyButton(field) {
    return isCopyCandidateField(field);
  }

  ensureCopyCommand(fieldId) {
    return this.copyFieldController.ensureCopyCommand(this.id, fieldId);
  }

  createRoot() {
    this.manifest.regions.formContainer.viewport = getResponsiveViewport();
    const effectiveResults = this.results ?? (this.formId ? this.store.getFormResults(this.formId) : []);
    const { rootNode, regions } = compileUIManifest(
      this.manifest,
      this.factories,
      this.commandRegistry,
      this.context,
      effectiveResults
    );

    this.rootNode = rootNode;
    this.regions = regions;

    this.results = effectiveResults;

    this.bindPhotoPreviewSelectionHandlers();
    this.bindPhotoPreviewHandlers();

    this.updateDeFacut()

    return rootNode;
  }

  updateDeFacut() {
    const remaining = (this.results || []).filter(r => r.done !== true).length;
  
    const node = this.context.fieldRegistry.get("defacut-text");
    if (!node) return;
  
    node.text = String(remaining);
    node.invalidate();
  }
  
  onEnter() {
   
  }

  onExit() {
    // If you later bind store subscriptions here, clean them up.
  }

  bindPhotoPreviewHandlers() {
    const entries = this.fields.filter((field) => this.isPhotoLikeField(field));

    this.photoPreviewController.bindPhotoFields(entries, {
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field)
    });
  }

  bindPhotoPreviewSelectionHandlers() {
    const container = this.regions?.formContainer;
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

        this.photoPreviewController.showBrightnessControl(fieldId);
        this.focusFieldInputForEditing(fieldId);
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
      this.rootNode?.invalidate?.();
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(activate);
      return;
    }

    setTimeout(activate, 0);
  }
}
