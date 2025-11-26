import { ACTIONS } from '../events/actions.js';
import { normalizeForm } from '../plugins/formManifests.js';

import { BaseScreen } from './baseScreen.js';

import { ManifestUI } from './manifestUI.js';


export const createFormManifest = {
  containers: [
    {
      idSuffix: 'editorContainer',
      type: 'container',
      layout: { x: 30, y: 80, width: 150, height: 300 },
      scroll: true,
      assignTo: 'editorContainer'
    },
    {
      idSuffix: 'formContainer',
      type: 'container',
      layout: { x: 200, y: 80, width: 600, height: 400 },
      scroll: true,
      assignTo: 'formContainer'
    }
  ],
  buttons: [
    {
      idSuffix: 'saveBtn',
      label: 'Save Form',
      type: 'button',
      action: (screen) => screen.handleSubmit()
    },
    
    {
      idSuffix: 'addTitleBtn',
      label: 'Add Text',
      type: 'button',
      action: (screen) => screen.addComponent('text')
    },
    {
      idSuffix: 'addInputBtn',
      label: 'Add Input',
      type: 'button',
      action: (screen) => screen.addComponent('input')
    },
    {
      idSuffix: 'addSubmitBtn',
      label: 'Add Submit Button',
      type: 'button',
      action: (screen) => screen.addComponent('button')
    }
  ]
};

export class CreateForm extends BaseScreen{
  constructor({ id='createForm', context, dispatcher, eventBusManager, store, onSubmit }) {
    super({ id, context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.manifest = {
      id:`form-${Date.now()}`,
      label: 'new form',
      formStructure:{
        fields:[
          {
            id: `title-${Date.now()}`,
            type: 'text',
            label: 'Form Title'
          }
        ]
      }, 
      user:'admin' };
    this.onSubmit = onSubmit;
    this.fieldComponents = new Map();
    this.manifestUI = new ManifestUI({ id: `${this.id}-manifestUI`, context, layoutManager: this.context.uiStage.layoutManager, layoutRenderer: this.context.uiStage.layoutRenderer });
    this.manifestUI.createFormScreen = this;
    this.rootElement.addChild(this.manifestUI);
    this.buildUI();
  }
  buildUI() {
    this.manifestUI.buildContainersFromManifest(createFormManifest.containers);
    this.manifestUI.buildChildrenFromManifest(createFormManifest.buttons, this.manifestUI.editorContainer);
    this.manifestUI.buildFormFromManifest(this.manifest, this.manifestUI.formContainer, {
      onSubmit: (responseData) => {
        this.handleSubmit(responseData);
      }
    });
  }
  addComponent(type) {
    const newField = {
      id: `${type}-${Date.now()}`,
      type,
      label: type === 'text' ? 'New Title' : type === 'input' ? 'New Input' : 'submit',
      placeholder: type === 'input' ? 'Enter text here...' : undefined,
    };
    this.manifest.formStructure.fields.push(newField);
   this.manifestUI.formContainer.clearChildren();
   this.manifestUI.buildFormFromManifest(this.manifest, this.manifestUI.formContainer, {
      onSubmit: (responseData) => {
        this.handleSubmit(responseData)
      },
      onDelete: (fieldId) => {
        this.deleteComponent(fieldId);
      }
   });
    this.context.pipeline.invalidate();
  }
  deleteComponent(fieldId) {
    this.manifest.formStructure.fields = this.manifest.formStructure.fields.filter(field => field.id !== fieldId);
    this.manifestUI.formContainer.clearChildren();
    this.manifestUI.buildFormFromManifest(this.manifest, this.manifestUI.formContainer, {
      onSubmit: (responseData) => {
        this.handleSubmit(responseData)
      },
      onDelete: (fieldId) => {
        this.deleteComponent(fieldId);
      }
   });
    this.context.pipeline.invalidate();
  }
  handleSubmit() {
    const normalizedForm = normalizeForm(this.manifest);
   
    this.onSubmit?.(normalizedForm);
    this.dispatcher.dispatch(
      ACTIONS.FORM.ADD,
      normalizedForm
    );
  }
}
