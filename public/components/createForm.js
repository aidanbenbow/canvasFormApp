import { ACTIONS } from '../events/actions.js';
import { FormReorderController } from '../controllers/formReorderController.js';
import { normalizeForm } from '../plugins/formManifests.js';
import { BaseScreen } from './baseScreen.js';
import { compileUIManifest } from './uiManifestCompiler.js';

const createFormUIManifest = {
  layout: 'vertical',
  id: 'create-form-root',
  style: {
    background: '#ffffff'
  },
  regions: {
    toolbar: {
      type: 'container',
      children: []
    },
    formContainer: {
      type: 'container',
      scrollable: true,
      viewport: 600,
      children: []
    }
  }
};

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
    this.dragHandleNodes = new Map();

    this.reorderController = new FormReorderController({
      context: this.context,
      dragThreshold: 8,
      getRootNode: () => this.rootNode,
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      onReorder: (sourceFieldId, targetFieldId) => this.reorderField(sourceFieldId, targetFieldId),
      onPreviewTargetChange: (fieldId) => this.setPreviewInsertion(fieldId)
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
    this.bindEditableNodes(this.regions?.formContainer);
    this.cacheDragHandleNodes(this.regions?.formContainer);
    this.applyPreviewToDragHandles();
    this.reorderController.attach();

    return rootNode;
  }

  buildScreenManifest() {
    const manifest = structuredClone(createFormUIManifest);
    manifest.id = this.mode === 'edit' ? 'edit-form-root' : 'create-form-root';

    manifest.regions.toolbar.children = [
      {
        type: 'button',
        id: 'save',
        label: this.mode === 'edit' ? 'Update Form' : 'Save Form',
        action: this.saveCommand,
        skipCollect: true,
        skipClear: true
      },
      {
        type: 'button',
        id: 'addText',
        label: 'Add Text',
        action: this.addTextCommand,
        skipCollect: true,
        skipClear: true
      },
      {
        type: 'button',
        id: 'addLabel',
        label: 'Add Label',
        action: this.addLabelCommand,
        skipCollect: true,
        skipClear: true
      },
      {
        type: 'button',
        id: 'addInput',
        label: 'Add Input',
        action: this.addInputCommand,
        skipCollect: true,
        skipClear: true
      },
      {
        type: 'button',
        id: 'addPhoto',
        label: 'Add Photo',
        action: this.addPhotoCommand,
        skipCollect: true,
        skipClear: true
      }
    ];

    manifest.regions.formContainer.children = this.getDisplayFields();
    return manifest;
  }

  getDisplayFields() {
    const smallScreen = isSmallScreen();

    const deleteButtonStyle = smallScreen
      ? {
          font: '28px sans-serif',
          minHeight: 52,
          width: 52,
          radius: 10
        }
      : {
          font: '18px sans-serif',
          minHeight: 24,
          width: 24,
          radius: 4
        };

    const fields = this.form?.formStructure?.fields || [];
    return fields.flatMap((field) => {
      const def = structuredClone(field);
      const nodes = [];

      if (def.type === 'text' && def.text == null) {
        def.text = def.label || 'Text';
      }

      if (def.type === 'button') {
        def.label = def.label || 'Submit';
        delete def.action;
        delete def.command;
      }

      if (this.mode === 'edit' && (def.type === 'input' || def.type === 'photo')) {
        def.editable = false;
      }

      if (def.type === 'text' || def.type === 'label') {
        def.editable = true;
      }

      nodes.push(
        {
          type: 'text',
          id: `drag-handle-${def.id}`,
          ...this.getDragHandlePresentation(def.id, { smallScreen })
        },
        def,
        {
          type: 'button',
          id: `delete-${def.id}`,
          label: '✖',
          action: this.deleteFieldCommand,
          payload: { fieldId: def.id },
          style: {
            textColor: '#ffffff',
            background: '#dc2626',
            hoverBackground: '#b91c1c',
            pressedBackground: '#991b1b',
            borderColor: '#7f1d1d',
            fillWidth: false,
            paddingX: 0,
            paddingY: 0,
            ...deleteButtonStyle
          },
          skipCollect: true,
          skipClear: true
        }
      );

      return nodes;
    });
  }

  setPreviewInsertion(fieldId) {
    const nextValue = fieldId ?? null;
    if (this.previewInsertionBeforeFieldId === nextValue) return;
    this.previewInsertionBeforeFieldId = nextValue;
    this.applyPreviewToDragHandles();
  }

  refreshFormContainer() {
    if (!this.regions?.formContainer) return;
    const nodes = this.getDisplayFields().map((def) => this.factories.basic.create(def));
    this.regions.formContainer.setChildren(nodes);
    this.bindEditableNodes(this.regions.formContainer);
    this.cacheDragHandleNodes(this.regions.formContainer);
    this.applyPreviewToDragHandles();
    this.rootNode.invalidate();
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

  resolveFieldIdFromNode(node, { allowDeleteNode = false, allowHandleNode = true } = {}) {
    const fieldIds = new Set((this.form?.formStructure?.fields || []).map((field) => field.id));
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

      if (fieldIds.has(id)) {
        return id;
      }

      current = current.parent;
    }

    return null;
  }

  reorderField(sourceFieldId, targetFieldId) {
    if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) return;

    const fields = Array.isArray(this.form?.formStructure?.fields)
      ? [...this.form.formStructure.fields]
      : [];

    const sourceIndex = fields.findIndex((field) => field.id === sourceFieldId);
    const targetIndex = fields.findIndex((field) => field.id === targetFieldId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const [movedField] = fields.splice(sourceIndex, 1);
    fields.splice(targetIndex, 0, movedField);
    this.form.formStructure.fields = fields;
    this.previewInsertionBeforeFieldId = null;
    this.refreshFormContainer();
  }

  bindEditableNodes(container) {
    if (!container) return;
    const fields = this.form?.formStructure?.fields || [];
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    const walk = (node) => {
      if (!node) return;
      const field = fieldMap.get(node.id);
      if (field && node.editable) {
        node.onChange = (value) => {
          field.text = value;
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
    this.form.formStructure.fields.push(newField);
    this.refreshFormContainer();
  }
  deleteComponent(fieldId) {
    if (!fieldId) return;
    this.form.formStructure.fields = this.form.formStructure.fields.filter(field => field.id !== fieldId);
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
    this.previewInsertionBeforeFieldId = null;
    this.reorderController.detach();
  }
}

function isSmallScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}
