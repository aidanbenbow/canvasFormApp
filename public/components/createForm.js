import { ACTIONS } from '../events/actions.js';
import { FormReorderController } from '../controllers/formReorderController.js';
import { PhotoPreviewController } from '../controllers/photoPreviewController.js';
import { getPhotoSource, isPhotoLikeField } from '../utils/fieldGuards.js';
import { normalizeFields } from '../utils/normalizeFields.js';
import {
  buildCreateDisplayFields,
  buildCreateFormManifest
} from './manifests/createFormManifest.js';
import { isSmallScreen } from './manifests/screenManifestUtils.js';
import { normalizeForm } from '../plugins/formManifests.js';
import { BaseScreen } from './baseScreen.js';
import { compileUIManifest } from './uiManifestCompiler.js';

export class CreateForm extends BaseScreen {
  constructor({ id='createForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, form }) {
    super({ id, context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.onSubmit = onSubmit;
    this.mode = form ? 'edit' : 'create';

    this.form = form
      ? structuredClone(form)
      : {
          id: `form-${Date.now()}`,
          label: 'new form',
          formStructure: {
            fields: [
              {
                id: `title-${Date.now()}`,
                type: 'text',
                label: 'Form Title'
              },
              {
                id: `submit-${Date.now()}`,
                type: 'button',
                label: 'Submit'
              }
            ]
          },
          user: 'admin'
        };

    this.saveCommand = `${this.id}.save`;
    this.addTextCommand = `${this.id}.addText`;
    this.addInputCommand = `${this.id}.addInput`;
    this.addLabelCommand = `${this.id}.addLabel`;
    this.addPhotoCommand = `${this.id}.addPhoto`;
    this.deleteFieldCommand = `${this.id}.deleteField`;

    this.commandRegistry.register(this.saveCommand, () => this.handleSubmit());
    this.commandRegistry.register(this.addTextCommand, () => this.addComponent('text'));
    this.commandRegistry.register(this.addInputCommand, () => this.addComponent('input'));
    this.commandRegistry.register(this.addLabelCommand, () => this.addComponent('label'));
    this.commandRegistry.register(this.addPhotoCommand, () => this.addComponent('photo'));
    this.commandRegistry.register(this.deleteFieldCommand, ({ fieldId } = {}) => this.deleteComponent(fieldId));

    this.previewInsertionBeforeFieldId = null;
    this.selectedFieldId = null;
    this.draggingFieldId = null;
    this.dragHandleNodes = new Map();
    this.fieldNodes = new Map();
    this.fieldBaseStyles = new Map();
    this.photoPreviewController = new PhotoPreviewController({ context: this.context });

    this.reorderController = new FormReorderController({
      context: this.context,
      dragThreshold: 8,
      getRootNode: () => this.rootNode,
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      onReorder: (sourceFieldId, targetFieldId) => this.reorderField(sourceFieldId, targetFieldId),
      onPreviewTargetChange: (fieldId) => this.setPreviewInsertion(fieldId),
      onDragStateChange: ({ active, sourceFieldId }) => this.setDraggingState(active, sourceFieldId)
    });
  }

  createRoot() {
    this.screenManifest = this.buildScreenManifest();
    const { rootNode, regions } = compileUIManifest(
      this.screenManifest,
      this.factories,
      this.commandRegistry,
      this.context
    );

    this.rootNode = rootNode;
    this.regions = regions;
    this.bindSelectionHandlers(this.regions?.formContainer);
    this.bindEditableNodes(this.regions?.formContainer);
    this.cacheDragHandleNodes(this.regions?.formContainer);
    this.cacheFieldNodes(this.regions?.formContainer);
    this.applyPreviewToDragHandles();
    this.applyPreviewToFields();
    this.reorderController.attach();

    return rootNode;
  }

  buildScreenManifest() {
    return buildCreateFormManifest({
      mode: this.mode,
      saveCommand: this.saveCommand,
      addTextCommand: this.addTextCommand,
      addLabelCommand: this.addLabelCommand,
      addInputCommand: this.addInputCommand,
      addPhotoCommand: this.addPhotoCommand,
      displayFields: this.getDisplayFields()
    });
  }

  getDisplayFields() {
    return buildCreateDisplayFields({
      fields: this.getNormalizedFields(),
      mode: this.mode,
      selectedFieldId: this.selectedFieldId,
      draggingFieldId: this.draggingFieldId,
      deleteFieldCommand: this.deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) => this.getDragHandlePresentation(fieldId, options),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field)
    });
  }

  setPreviewInsertion(fieldId) {
    const nextValue = fieldId ?? null;
    if (this.previewInsertionBeforeFieldId === nextValue) return;
    this.previewInsertionBeforeFieldId = nextValue;
    this.applyPreviewToDragHandles();
    this.applyPreviewToFields();
  }

  refreshFormContainer() {
    if (!this.regions?.formContainer) return;
    this.stopActiveEditing();
    const nodes = this.getDisplayFields().map((def) => this.factories.basic.create(def));
    this.regions.formContainer.setChildren(nodes);
    this.bindSelectionHandlers(this.regions.formContainer);
    this.bindEditableNodes(this.regions.formContainer);
    this.cacheDragHandleNodes(this.regions.formContainer);
    this.cacheFieldNodes(this.regions.formContainer);
    this.applyPreviewToDragHandles();
    this.applyPreviewToFields();
    this.rootNode.invalidate();
  }

  getPhotoSource(field) {
    return getPhotoSource(field);
  }

  isPhotoLikeField(field) {
    return isPhotoLikeField(field);
  }

  getNormalizedFields() {
    return normalizeFields(this.form?.formStructure);
  }

  setNormalizedFields(fields) {
    if (!this.form.formStructure || typeof this.form.formStructure !== 'object') {
      this.form.formStructure = { fields: [] };
    }
    this.form.formStructure.fields = Array.isArray(fields) ? fields : [];
  }

  stopActiveEditing() {
    const editor = this.context?.textEditorController;
    if (!editor?.activeNode) return;
    editor.stopEditing();
  }

  setDraggingState(isActive, sourceFieldId) {
    const nextDraggingFieldId = isActive ? (sourceFieldId ?? null) : null;
    if (this.draggingFieldId === nextDraggingFieldId) return;

    if (isActive) {
      this.stopActiveEditing();
    }

    this.draggingFieldId = nextDraggingFieldId;
    this.refreshFormContainer();
  }

  bindSelectionHandlers(container) {
    if (!container) return;

    const previousCapture = container.onEventCapture?.bind(container);
    container.onEventCapture = (event) => {
      const handledByPrevious = previousCapture?.(event);
      if (handledByPrevious) return true;

      if (event.type !== 'mousedown' && event.type !== 'click') {
        return false;
      }

      const fieldId = this.resolveFieldIdFromNode(event.target, {
        allowDeleteNode: true,
        allowHandleNode: true
      });
      if (!fieldId) return false;

      this.setSelectedField(fieldId);
      return false;
    };
  }

  setSelectedField(fieldId) {
    const nextFieldId = fieldId ?? null;
    if (this.selectedFieldId === nextFieldId) return;
    this.stopActiveEditing();
    this.selectedFieldId = nextFieldId;
    this.previewInsertionBeforeFieldId = null;
    this.refreshFormContainer();
  }

  getDragHandlePresentation(fieldId, { smallScreen }) {
    const isPreviewTarget = this.previewInsertionBeforeFieldId === fieldId;
    if (isPreviewTarget) {
      return {
        text: '',
        style: {
          color: '#0078ff',
          backgroundColor: '#0078ff',
          borderColor: '#005fcc',
          align: 'center',
          font: smallScreen ? '14px sans-serif' : '8px sans-serif',
          radius: smallScreen ? 10 : 6,
          paddingX: 0,
          paddingY: 0
        }
      };
    }

    return {
      text: '↕ Drag to reorder',
      style: {
        color: '#1f2937',
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
        align: 'center',
        ...(smallScreen
          ? {
              font: '30px sans-serif',
              paddingX: 18,
              paddingY: 14,
              radius: 8
            }
          : {
              font: '18px sans-serif',
              paddingX: 10,
              paddingY: 6,
              radius: 4
            })
      }
    };
  }

  cacheDragHandleNodes(container) {
    this.dragHandleNodes = new Map();
    if (!container) return;

    const walk = (node) => {
      if (!node) return;
      if (typeof node.id === 'string' && node.id.startsWith('drag-handle-')) {
        const fieldId = node.id.slice('drag-handle-'.length);
        this.dragHandleNodes.set(fieldId, node);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }

  applyPreviewToDragHandles() {
    if (!this.dragHandleNodes?.size) return;
    const smallScreen = isSmallScreen();

    for (const [fieldId, node] of this.dragHandleNodes.entries()) {
      const presentation = this.getDragHandlePresentation(fieldId, { smallScreen });
      node.text = presentation.text;
      node.style = { ...presentation.style };
    }

    this.rootNode?.invalidate();
  }

  cacheFieldNodes(container) {
    this.fieldNodes = new Map();
    this.fieldBaseStyles = new Map();
    if (!container) return;

    const fieldIds = new Set(this.getNormalizedFields().map((field) => field.id));
    const walk = (node) => {
      if (!node) return;
      if (fieldIds.has(node.id)) {
        this.fieldNodes.set(node.id, node);
        this.fieldBaseStyles.set(node.id, { ...(node.style || {}) });
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }

  applyPreviewToFields() {
    if (!this.fieldNodes?.size) return;

    const hasPreview = Boolean(this.draggingFieldId && this.previewInsertionBeforeFieldId);
    for (const [fieldId, node] of this.fieldNodes.entries()) {
      const baseStyle = this.fieldBaseStyles.get(fieldId) || {};
      const isPreviewTarget = hasPreview && fieldId === this.previewInsertionBeforeFieldId;

      if (isPreviewTarget) {
        node.style = {
          ...baseStyle,
          borderColor: '#2563eb',
          focusBorderColor: '#2563eb',
          backgroundColor: '#dbeafe',
          radius: Math.max(6, Number(baseStyle.radius || 0))
        };
      } else {
        node.style = { ...baseStyle };
      }

      if (typeof node.setUIState === 'function') {
        node.setUIState({ selected: Boolean(isPreviewTarget) });
      }
    }

    this.rootNode?.invalidate();
  }

  resolveFieldIdFromNode(node, { allowDeleteNode = false, allowHandleNode = true } = {}) {
    const fieldIds = new Set(this.getNormalizedFields().map((field) => field.id));
    let current = node;

    while (current) {
      const id = current.id;
      if (allowDeleteNode && typeof id === 'string' && id.startsWith('delete-')) {
        const parsed = id.slice('delete-'.length);
        if (fieldIds.has(parsed)) return parsed;
      }

      if (allowHandleNode && typeof id === 'string' && id.startsWith('drag-handle-')) {
        const parsed = id.slice('drag-handle-'.length);
        if (fieldIds.has(parsed)) return parsed;
      }

      if (typeof id === 'string' && id.startsWith('photo-preview-')) {
        const parsed = id.slice('photo-preview-'.length);
        if (fieldIds.has(parsed)) return parsed;
      }

      if (fieldIds.has(id)) {
        return id;
      }

      current = current.parent;
    }

    return null;
  }

  reorderField(sourceFieldId, targetFieldId) {
    if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) return;

    const fields = [...this.getNormalizedFields()];

    const sourceIndex = fields.findIndex((field) => field.id === sourceFieldId);
    const targetIndex = fields.findIndex((field) => field.id === targetFieldId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const [movedField] = fields.splice(sourceIndex, 1);
    fields.splice(targetIndex, 0, movedField);
    this.setNormalizedFields(fields);
    this.previewInsertionBeforeFieldId = null;
    this.draggingFieldId = null;
    this.refreshFormContainer();
  }

  bindEditableNodes(container) {
    if (!container) return;
    const fields = this.getNormalizedFields();
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    const walk = (node) => {
      if (!node) return;
      const field = fieldMap.get(node.id);
      if (field && node.editable) {
        node.onChange = (value) => {
          field.text = value;
          if (this.isPhotoLikeField(field)) {
            field.src = value;
            field.value = value;
            this.photoPreviewController.updatePreviewForField(field.id, this.getPhotoSource(field));
          }
          if (field.label !== undefined) {
            field.label = value;
          }
        };
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }

  addComponent(type) {
    const newField = {
      id: `${type}-${Date.now()}`,
      type,
      label:
        type === 'text'
          ? 'New Title'
          : type === 'label'
            ? 'New Label'
            : type === 'input'
              ? 'New Input'
              : type === 'photo'
                ? 'Photo URL'
                : 'submit',
      placeholder: type === 'input' || type === 'photo' ? 'Enter text here...' : undefined,
    };
    if (type === 'label') {
      newField.text = newField.label;
    }
    const fields = [...this.getNormalizedFields(), newField];
    this.setNormalizedFields(fields);
    this.selectedFieldId = newField.id;
    this.refreshFormContainer();
  }
  deleteComponent(fieldId) {
    if (!fieldId) return;
    const fields = this.getNormalizedFields().filter(field => field.id !== fieldId);
    this.setNormalizedFields(fields);
    if (this.selectedFieldId === fieldId) {
      this.selectedFieldId = fields[0]?.id ?? null;
      this.previewInsertionBeforeFieldId = null;
    }
    this.refreshFormContainer();
  }
  handleSubmit() {
    const normalizedForm = normalizeForm(this.form);

    this.onSubmit?.(normalizedForm);
    this.dispatcher.dispatch(
      ACTIONS.FORM.ADD,
      normalizedForm
    );
  }

  onExit() {
    this.stopActiveEditing();
    this.previewInsertionBeforeFieldId = null;
    this.selectedFieldId = null;
    this.draggingFieldId = null;
    this.reorderController.detach();
  }
}
