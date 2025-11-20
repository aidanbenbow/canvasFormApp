import { UIElement } from './UiElement.js';
import { UIText } from './text.js';
import { UIInputBox } from './inputBox.js';
import { UIButton } from './button.js';
import { createFieldComponent, createToolbarButton, createUIComponent } from './createUIComponent.js';

const toolbarManifest = [
  {
    label: 'Save Form',
    action: (editor) => editor.handleSubmit()
  },
  {
    label: 'Add Text',
    action: (editor) => editor.addComponent('text')
  },
  {
    label: 'Add Input',
    action: (editor) => editor.addComponent('input')
  },
  {
    label: 'Add Submit Button',
    action: (editor) => editor.addComponent('button')
  }
];

const containerManifest = [
  {
    idSuffix: 'container',
    type: 'container',
    layout: { x: 10, y: 10, width: 100, height: 300 },
    scroll: true,
    assignTo: 'uiContainer'
  },
  {
    idSuffix: 'formContainer',
    type: 'container',
    layout: { x: 120, y: 10, width: 400, height: 300 },
    scroll: true,
    assignTo: 'formContainer'
  }
];

export class FormEditor extends UIElement {
  constructor({ id = 'formEditor',context, layoutManager, layoutRenderer,  form, onSubmit }) {
    super({ id,context, layoutManager, layoutRenderer });
    this.editorController = context?.textEditorController;
    this.form = form
    this.onSubmit = onSubmit;
this.title = null;
this.formContainer = null;
this.uiContainer = null;
    this.buildLayout();
   this.buildUI();
  }

  buildLayout() {
this.buildContainersFromManifest(containerManifest);
         this.buildToolbar(toolbarManifest);
  }
  buildToolbar(manifest) {
    manifest.forEach(({ label, action }) => {
      const button = createToolbarButton(label, () => action(this), this.context);
      this.uiContainer.addChild(button);
    });
  }


  addComponent(type) {
    const { field, component } = createFieldComponent(type, this.context);
    console.log('Adding component:', field);
    this.form?.formStructure.fields.push(field);
    this.formContainer.addChild(component);
    this.context.pipeline.invalidate()
  }

  buildUI() {
    this.title = createUIComponent({
        id: `${this.id}-title`,
        type: 'text',
        label: `${this.form?.label || 'Untitled Form'}`
    }, this.context);
    this.formContainer.addChild(this.title);

    this.form?.formStructure.fields.forEach((field, index) => {
        const fieldComponent = createUIComponent(field, this.context);
        this.formContainer.addChild(fieldComponent);
    });

  }

  handleSubmit() {
    const updatedForm = {
      id: this.form?.id || `form-${Date.now()}`,
      label: this.title.text|| 'Untitled',
      user: this.form?.user || 'admin',
      lastModified: new Date().toISOString(),
      formStructure: {
        fields: [],
      }
    };
  
    this.formContainer.children.forEach(child => {
      const id = child.id;
      const layout = this.context.uiStage.layoutManager.getLogicalBounds(id);
      const field = {
        id,
        type: child.type,
        label: child.text || child.label || child.labelElement?.text || '',
        layout
      };
  
      updatedForm.formStructure.fields.push(field);
    
    });
  
    this.onSubmit?.(updatedForm);
  }

 
}
