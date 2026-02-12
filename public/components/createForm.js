import { ACTIONS } from '../events/actions.js';
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

    this.commandRegistry.register(this.saveCommand, () => this.handleSubmit());
    this.commandRegistry.register(this.addTextCommand, () => this.addComponent('text'));
    this.commandRegistry.register(this.addInputCommand, () => this.addComponent('input'));
    this.commandRegistry.register(this.addLabelCommand, () => this.addComponent('label'));
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
      }
    ];

    manifest.regions.formContainer.children = this.getDisplayFields();
    return manifest;
  }

  getDisplayFields() {
    const fields = this.form?.formStructure?.fields || [];
    return fields.map((field) => {
      const def = structuredClone(field);

      if (def.type === 'text' && def.text == null) {
        def.text = def.label || 'Text';
      }

      if (def.type === 'button') {
        def.label = def.label || 'Submit';
        delete def.action;
        delete def.command;
      }

      return def;
    });
  }

  refreshFormContainer() {
    if (!this.regions?.formContainer) return;
    const nodes = this.getDisplayFields().map((def) => this.factories.basic.create(def));
    this.regions.formContainer.setChildren(nodes);
    this.rootNode.invalidate();
  }

  addComponent(type) {
    const newField = {
      id: `${type}-${Date.now()}`,
      type,
      label: type === 'text' ? 'New Title' : type === 'label' ? 'New Label' : type === 'input' ? 'New Input' : 'submit',
      placeholder: type === 'input' ? 'Enter text here...' : undefined,
    };
    if (type === 'label') {
      newField.text = newField.label;
    }
    this.form.formStructure.fields.push(newField);
    this.refreshFormContainer();
  }
  deleteComponent(fieldId) {
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
}
