import { UIElement } from './UiElement.js';

import { UIButton } from './button.js';
import { createUIComponent } from './createUIComponent.js';
import { UIInputBox } from './inputBox.js';
import { LabeledInput } from './labeledInput.js';
import { PlaceholderPromptOverlay } from './placeHolderOverlay.js';
import { UIScrollContainer } from './scrollContainer.js';
import { UIText } from './text.js';

export class CreateForm extends UIElement {
  constructor({ id = 'createForm', layoutManager, layoutRenderer, context, manifest, onSubmit }) {
    super({ id, layoutManager, layoutRenderer });
    this.context = context;
    this.editorController = context?.textEditorController;
    this.manifest = manifest;
    console.log(manifest);
    this.formLabel = manifest.label || 'new form';
    this.onSubmit = onSubmit;

    this.fieldComponents = new Map();
    this.formContainer = null;
    this.buildUI();
   this.buildFromManifest();
  }

  buildUI() {
    const UIcontainer = createUIComponent({
      id: `${this.id}-container`,
      type: 'container',
      layout: { x: 30, y: 80, width: 100, height: 300 }
    }, this.context);
    UIcontainer.initializeScroll();
    this.addChild(UIcontainer);
    const saveBtn = createUIComponent({
      id: `${this.id}-saveBtn`,
      type: 'button',
      label: 'Save Form',
      
      onClick: () => this.handleSubmit()
    }, this.context, {place: false});
    
const addTitleBtn = createUIComponent({
      id: `${this.id}-addTitle`,
      type: 'button',
      label: 'Add Title',
      layout: { x: 20, y: 100, width: 100, height: 40 },
      onClick: () => this.addCompenent('text')
    }, this.context, {place: false});
const addInputBtn = createUIComponent({
      id: `${this.id}-addInput`,
      type: 'button',
      label: 'Add Input',
      layout: { x: 20, y: 160, width: 100, height: 40 },
      onClick: () => this.addCompenent('input')
    }, this.context, {place: false});
    const addSubmitBtn = createUIComponent({
      id: `${this.id}-addSubmit`,
      type: 'button',
      label: 'Add Submit Button',
      layout: { x: 20, y: 220, width: 100, height: 40 },
      onClick: () => this.addCompenent('button')
    }, this.context, {place: false});
    UIcontainer.addChild(saveBtn);
    UIcontainer.addChild(addTitleBtn);
    UIcontainer.addChild(addInputBtn);
    UIcontainer.addChild(addSubmitBtn);

  }

  buildFromManifest() {
    this.formContainer= createUIComponent({
      id: `${this.id}-formContainer`,
      type: 'container',
      layout: { x: 200, y: 80, width: 600, height: 400 },
      childSpacing: 15,
      defaultChildHeight: 70
    }, this.context);
    this.formContainer.initializeScroll();
    this.addChild(this.formContainer)
    
  }

  addCompenent(type) {
    switch(type) {
      case 'text':
     const newField = {
          id: `input-${Date.now()}`,
          type: 'text',
          label: 'New Title',
          // layout: { x: 225, y: 10 + this.fieldComponents.size * 65, width: 450, height: 60 }
        };
        this.manifest.fields.push(newField);
        const title = createUIComponent({
          id: newField.id,
          type: 'text',
          label: newField.label,
          // layout: newField.layout
        }, this.context);
        this.fieldComponents.set(newField.id, title);
         this.formContainer.addChild(title);
         break;
      case 'input':
        const newInputField = {
            id: `input-${Date.now()}`,
            type: 'input',
            label: 'New Input',
            placeholder: 'Enter text here...',
           
          };
          this.manifest.fields.push(newInputField);
          const inputBox = createUIComponent({
            id: newInputField.id,
            type: 'input',
            label: newInputField.label,
            placeholder: newInputField.placeholder,
          
          }, this.context, {place: false});
          this.fieldComponents.set(newInputField.id, inputBox);
          this.formContainer.addChild(inputBox);
          break;
          case 'button':
          const newButtonField = {
              id: `button-${Date.now()}`,
              type: 'button',
              label: 'submit',
             
            };
            this.manifest.fields.push(newButtonField);
            const button = createUIComponent({
              id: newButtonField.id,
              type: 'button',
              label: newButtonField.label,
             
            }, this.context, {place: false});
            this.fieldComponents.set(newButtonField.id, button);
            this.formContainer.addChild(button);
            break;
        }
this.context.pipeline.invalidate();
  }

  handleSubmit() {
    const updatedFields = this.manifest.fields.map(field => {
      const component = this.fieldComponents.get(field.id);
      if (component instanceof UIInputBox) {
        return {
          ...field,
          placeholder: component.placeholder
        };
      }
      return field;
    });

    const updatedManifest = {
      ...this.manifest,
      fields: updatedFields
    };
console.log('Form saved with manifest:', updatedManifest);
    //this.onSubmit?.(updatedManifest);
  }

  onChildEvent(event, child) {
    if (
      event.type === 'click' &&
      child instanceof UIInputBox &&
      child.interactive === false
    ) {
      const overlay = new PlaceholderPromptOverlay({
        targetBox: child,
        layoutManager: this.layoutManager,
        layoutRenderer: this.layoutRenderer,
        context: this.context,
        onConfirm: newText => {
          child.label = newText;
          this.manifest.fields = this.manifest.fields.map(field => {
            if (field.id === child.id) {
              return { ...field, label: newText };
            }
            return field;
          });
          this.context.pipeline.invalidate();
        }
      });

      this.context.uiStage.overlayRoot = overlay;
      overlay.registerHitRegions(this.context.hitRegistry);
      this.context.pipeline.invalidate();
      return true;
    }

    return super.onChildEvent?.(event, child);
  }
}

