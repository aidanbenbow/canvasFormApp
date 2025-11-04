import { UIElement } from './UiElement.js';
import { UIText } from './text.js';
import { UIInputBox } from './inputBox.js';
import { UIButton } from './button.js';

export class FormEditor extends UIElement {
  constructor({ id = 'formEditor', layoutManager, layoutRenderer, context, form, onSubmit }) {
    super({ id, layoutManager, layoutRenderer });
    this.editorController = context?.textEditorController;
    this.originalForm = form;
    this.onSubmit = onSubmit;

    this.formLabel = form.label;
    this.formStructure = [...form.formStructure]; // clone for editing
console.log('FormEditor initialized with form:', this.formStructure[0].layout);
    this.buildLayout();
    this.buildUI();
  }

  buildLayout() {
    this.layoutManager.place({ id: `${this.id}-title`, x: 20, y: 20, width: 200, height: 40 });
    this.layoutManager.place({ id: `${this.formStructure[0].id}`, x: this.formStructure[0].layout.x, y: this.formStructure[0].layout.y, width: this.formStructure[0].layout.width, height: this.formStructure[0].layout.height });
    this.layoutManager.place({ id: `${this.id}-submitButton`, x: 400, y: 20, width: 100, height: 40 });
    // You can add layout for editing fields here
  }

  buildUI() {
    this.addChild(new UIText({
      id: `${this.id}-title`,
      text:     `Edit Form ${this.formLabel}`,
      fontSize: 0.03,
      color: '#333',
      align: 'left',
      valign: 'top'
    }));

    const labelInput = new UIInputBox({
      id: `${this.formStructure[0].id}`,
      editorController: this.editorController,
      placeholder: 'Form Label',
      onChange: value => { this.formLabel = value; }
    });
labelInput.draggable = true;
    // Pre-fill the label
    this.editorController?.startEditing(labelInput, 'text');
    this.editorController.activeBox.text = this.formStructure[0]?.placeholder || '';

    const submitButton = new UIButton({
      id: `${this.id}-submitButton`,
      label: 'Save',
      onClick: () => {
        if (this.formLabel?.trim()) {
          const updatedForm = {
            ...this.originalForm,
            label: this.formLabel,
            formStructure: this.formStructure
          };
          this.onSubmit?.(updatedForm);
        }
      }
    });

    this.addChild(labelInput);
    this.addChild(submitButton);
  }

  registerHitRegions(hitRegistry) {
    this.children.forEach(child => {
      hitRegistry.register(child.id, {
        plugin: this,
        region: 'button',
        box: child
      });
    });
  }
}
