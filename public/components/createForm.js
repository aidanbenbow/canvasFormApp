import { UIElement } from './UiElement.js';
import { BaseScreen } from './baseScreen.js';

import { UIButton } from './button.js';
import { createUIComponent } from './createUIComponent.js';
import { UIInputBox } from './inputBox.js';
import { LabeledInput } from './labeledInput.js';
import { ManifestUI } from './manifestUI.js';
import { PlaceholderPromptOverlay } from './placeHolderOverlay.js';
import { UIScrollContainer } from './scrollContainer.js';
import { UIText } from './text.js';

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
      label: 'Add Title',
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
    this.manifest = {label: 'new form', fields: [] };
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
  }
  addComponent(type) {
    const newField = {
      id: `${type}-${Date.now()}`,
      type,
      label: type === 'text' ? 'New Title' : type === 'input' ? 'New Input' : 'submit',
      placeholder: type === 'input' ? 'Enter text here...' : undefined,
    };
    this.manifest.fields.push(newField);
    const component = createUIComponent({
      id: newField.id,
      type: newField.type,
      label: newField.label,
      placeholder: newField.placeholder,
    }, this.context, { place: false });
    this.fieldComponents.set(newField.id, component);
    this.manifestUI.formContainer.addChild(component);
    this.context.pipeline.invalidate();
  }
  handleSubmit() {
    this.fieldComponents.forEach((component, id) => {
      const layout = this.context.uiStage.layoutManager.getLogicalBounds(id);
      
      this.manifest.fields = this.manifest.fields.map(field => {
        if(field.id !== id) return field;
        const updated = { ...field, layout };
      
          if (component instanceof LabeledInput) {
            const labelText = component.getChildById(`${id}-label`)
            if(labelText instanceof UIText){
           updated.label = labelText.text;}
          } else if (component instanceof UIText) {
            updated.label = component.text;
          } else if (component instanceof UIButton) {
            updated.label = component.label;
          }
          if(component instanceof UIInputBox){
            updated.placeholder = component.placeholder;
          }
        
        return updated;
      });
      this.manifest.label = this.manifest.fields[0]?.label || 'new form';
    console.log('Updated manifest:', this.manifest);
this.onSubmit?.(this.manifest);
    });
  }
}
