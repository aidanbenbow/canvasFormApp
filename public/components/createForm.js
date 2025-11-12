import { UIElement } from './UiElement.js';

import { UIButton } from './button.js';
import { createUIComponent } from './createUIComponent.js';
import { UIInputBox } from './inputBox.js';
import { LabeledInput } from './labeledInput.js';
import { PlaceholderPromptOverlay } from './placeHolderOverlay.js';
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
    
    this.buildUI();
   this.buildFromManifest();
  }

  buildUI() {
    const saveBtn = createUIComponent({
      id: `${this.id}-saveBtn`,
      type: 'button',
      label: 'Save Form',
      layout: { x: 20, y: 20, width: 100, height: 40 },
      onClick: () => this.handleSubmit()
    }, this.context);
const addTitleBtn = createUIComponent({
      id: `${this.id}-addTitle`,
      type: 'button',
      label: 'Add Title',
      layout: { x: 20, y: 100, width: 100, height: 40 },
      onClick: () => this.addCompenent('text')
    }, this.context);
const addInputBtn = createUIComponent({
      id: `${this.id}-addInput`,
      type: 'button',
      label: 'Add Input',
      layout: { x: 20, y: 160, width: 100, height: 40 },
      onClick: () => this.addCompenent('input')
    }, this.context);

    this.addChild(addTitleBtn);
    this.addChild(addInputBtn);
    this.addChild(saveBtn);

  }

  buildFromManifest() {

    this.manifest.fields.forEach(field => {
      const { id, type, label, placeholder, layout } = field;
console.log(field);
switch(type) {
        case 'text':
          const title = createUIComponent({
            id,
            type: 'text',
            label,
            layout
          }, this.context);
          this.fieldComponents.set(id, title);
          this.addChild(title);
          break;
        case 'input':
          const inputBox = createUIComponent({
            id,
            type: 'input',
            label,
            placeholder,
            layout
          }, this.context);
          this.fieldComponents.set(id, inputBox);
          this.addChild(inputBox);
          break;
          case 'button':
          const button = createUIComponent({
            id,
            type: 'button',
            label,
            layout
          }, this.context);
          this.fieldComponents.set(id, button);
          this.addChild(button);
        }
  
    });
    
  }

  addCompenent(type) {
    switch(type) {
      case 'text':
     const newField = {
          id: `input-${Date.now()}`,
          type: 'text',
          label: 'New Title',
          layout: { x: 225, y: 10 + this.fieldComponents.size * 65, width: 450, height: 60 }
        };
        this.manifest.fields.push(newField);
        const title = createUIComponent({
          id: newField.id,
          type: 'text',
          label: newField.label,
          layout: newField.layout
        }, this.context);
        this.fieldComponents.set(newField.id, title);
         this.addChild(title);
         break;
      case 'input':
        const newInputField = {
            id: `input-${Date.now()}`,
            type: 'input',
            label: 'New Input',
            placeholder: 'Enter text here...',
            layout: { x: 225, y: 10 + this.fieldComponents.size * 65, width: 450, height: 60 }
          };
          this.manifest.fields.push(newInputField);
          const inputBox = createUIComponent({
            id: newInputField.id,
            type: 'input',
            label: newInputField.label,
            placeholder: newInputField.placeholder,
            layout: newInputField.layout
          }, this.context);
          this.fieldComponents.set(newInputField.id, inputBox);
          this.addChild(inputBox);
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

