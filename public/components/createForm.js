import { UIElement } from './UiElement.js';

import { UIButton } from './button.js';
import { UIInputBox } from './inputBox.js';
import { UIText } from './text.js';

export class CreateForm extends UIElement {
  constructor({ id = 'createForm', layoutManager, layoutRenderer,context, onSubmit }) {
    super({ id, layoutManager, layoutRenderer });
    this.onSubmit = onSubmit;
this.editorController = context?.textEditorController;
    this.buildLayout();
    this.buildUI();
  }

  buildLayout() {
    this.layoutManager.place({ id: `${this.id}-title`, x: 20, y: 20, width: 200, height: 40 });
    this.layoutManager.place({ id: `${this.id}-labelInput`, x: 20, y: 80, width: 200, height: 40 });
    this.layoutManager.place({ id: `${this.id}-submitButton`, x: 20, y: 140, width: 100, height: 40 });
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

    const submitButton = new UIButton({
      id: `${this.id}-submitButton`,
      label: 'Create',
      onClick: () => {
        if (this.formLabel?.trim()) {
          this.onSubmit?.({ label: this.formLabel, formStructure: [] });
        }
      }
    });

    this.addChild(labelInput);
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
}
