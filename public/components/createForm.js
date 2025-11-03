import { UIElement } from './UiElement.js';

import { UIButton } from './button.js';
import { UIInputBox } from './inputBox.js';
import { UIText } from './text.js';

export class CreateForm extends UIElement {
  constructor({ id = 'createForm', layoutManager, layoutRenderer,context, onSubmit }) {
    super({ id, layoutManager, layoutRenderer });
    this.onSubmit = onSubmit;
this.editorController = context?.textEditorController;
this.context = context;
    this.buildLayout();
    this.buildUI();
  }

  buildLayout() {
    this.layoutManager.place({ id: `${this.id}-title`, x: 20, y: 20, width: 200, height: 40 });
    this.layoutManager.place({ id: `${this.id}-addInput`, x: 20, y: 80, width: 200, height: 40 });
    this.layoutManager.place({ id: `${this.id}-labelInput`, x: 20, y: 140, width: 200, height: 40 });
    this.layoutManager.place({ id: `${this.id}-submitButton`, x: 20, y: 200, width: 100, height: 40 });
  }

  buildUI() {
    this.addChild(new UIText({
      id: `${this.id}-title`,
      text: 'Create New Form',
      fontSize: 0.03,
      color: '#333',
      align: 'left',
      valign: 'top'
    }));

    const labelInput = new UIInputBox({
      id: `${this.id}-labelInput`,
      editorController: this.editorController,
      placeholder: 'Form Label',
      onChange: value => { this.formLabel = value; }
    });

    const addInputButton = new UIButton({
        id: `${this.id}-addInput`,
        label: 'Add Input Field',
        onClick: () => {
            const inputField = new UIInputBox({
            id: `${this.id}-inputField-${Date.now()}`,
            editorController: this.editorController,
            placeholder: 'Input Field'
            });
            this.addInputBox(inputField);
        }
        });

    const submitButton = new UIButton({
      id: `${this.id}-submitButton`,
      label: 'Create',
      onClick: () => {
        if (this.formLabel?.trim()) {
          this.onSubmit?.({ label: this.formLabel, formStructure: [] });
        }
      }
    });

    this.addChild(addInputButton);
    this.addChild(submitButton);
  }

  registerHitRegions(hitRegistry) {
    this.children.forEach(child => {
      hitRegistry.register(`${child.id}`, {
        plugin: this,
        region: 'button',
        box: child
      });
    });
  }

  addInputBox(inputBox) {
    this.addChild(inputBox);
    const nextY = this.calculateNextY(); // your own logic
this.layoutManager.place({
  id: inputBox.id,
  x: 20,
  y: nextY,
  width: 200,
  height: 40
});

    this.context.pipeline.invalidate();
  }
  calculateNextY() {
    let maxY = 140; // starting Y after title and label input
    this.children.forEach(child => {
      const bounds = this.layoutManager.getLogicalBounds(child.id);
      if (bounds && bounds.y != null && bounds.height != null) {
        const bottom = bounds.y + bounds.height;
        if (bottom > maxY) {
          maxY = bottom;
        }
      }
    });
    return maxY + 20; // add spacing
  }
  
}
