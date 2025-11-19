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
    label: 'Add Title',
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
    this.form = form;
    this.onSubmit = onSubmit;

this.formContainer = null;
this.uiContainer = null;
    this.buildLayout();
   this.buildUI();
  }

  buildLayout() {
  //  this.uiContainer = createUIComponent({
  //     id: `${this.id}-container`,
  //     type: 'container',
  //     layout: { x: 10, y: 10, width: 100, height: 300 }
  //    }, this.context);
  //      this.uiContainer.initializeScroll();
  //      this.addChild(this.uiContainer);

  //      this.formContainer = createUIComponent({
  //       id: `${this.id}-formContainer`,
  //       type: 'container',
  //       layout: { x: 120, y: 10, width: 400, height: 300 }
  //      }, this.context);
  //        this.formContainer.initializeScroll();
  //        this.addChild(this.formContainer);
this.buildContainersFromManifest(containerManifest);
         this.buildToolbar(toolbarManifest);
        //  const saveBtn = createToolbarButton('Save Form', () => { this.handleSubmit() }
        //   , this.context);
          
        //   const addTitleBtn = createToolbarButton('Add Title', () => { this.addComponent('text') }, this.context);
        //   const addInputBtn = createToolbarButton('Add Input', () => { this.addComponent('input') }, this.context);
        //   const addSubmitBtn = createToolbarButton('Add Submit Button', () => { this.addComponent('button') }, this.context);
        //   this.uiContainer.addChild(saveBtn);
        //   this.uiContainer.addChild(addTitleBtn);
        //   this.uiContainer.addChild(addInputBtn);
        //   this.uiContainer.addChild(addSubmitBtn);
       
  }
  buildToolbar(manifest) {
    manifest.forEach(({ label, action }) => {
      const button = createToolbarButton(label, () => action(this), this.context);
      this.uiContainer.addChild(button);
    });
  }
  buildContainersFromManifest(manifest) {
    manifest.forEach(({ idSuffix, type, layout, scroll, assignTo }) => {
      const component = createUIComponent({
        id: `${this.id}-${idSuffix}`,
        type,
        layout
      }, this.context);
  
      if (scroll) component.initializeScroll();
      this.addChild(component);
      if (assignTo) this[assignTo] = component;
    });
  }

  addComponent(type) {
    const { field, component } = createFieldComponent(type, this.context);
    console.log('Adding component:', field);
    this.form?.formStructure.fields.push(field);
    this.formContainer.addChild(component);
    //this.formContainer.layoutChildrenVertically(10, 50);
    this.context.pipeline.invalidate()
  }

  buildUI() {
    const title = createUIComponent({
        id: `${this.id}-title`,
        type: 'text',
        label: `Editing Form: ${this.form?.label || 'Untitled Form'}`
    }, this.context);
    this.formContainer.addChild(title);

    this.form?.formStructure.fields.forEach((field, index) => {
        const fieldComponent = createUIComponent(field, this.context);
        this.formContainer.addChild(fieldComponent);
    });

  }

  handleSubmit() {
    const updatedForm = {
      ...this.form,
      formStructure: {
        fields: [],
        layout: {}
      }
    };
  
    this.formContainer.children.forEach(child => {
      const id = child.id;
      const layout = this.context.uiStage.layoutManager.getLogicalBounds(id);
      const field = {
        id,
        type: child.type,
        label: child.label || '',
        layout
      };
  
      if (child.placeholder) {
        field.placeholder = child.placeholder;
      }
  
      updatedForm.formStructure.fields.push(field);
      updatedForm.formStructure.layout[id] = layout;
    });
  
    this.onSubmit?.(updatedForm);
  }

 
}
