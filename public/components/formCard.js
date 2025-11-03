import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';
import { UIText } from './text.js';

export class UIFormCard extends UIElement {
  constructor({ id, form, layoutManager, layoutRenderer, onEdit, onView }) {
    super({ id, layoutManager, layoutRenderer });
    this.form = form;
    this.onEdit = onEdit;
    this.onView = onView;

    this.buildLayout();
    this.buildUI();
  }

  buildLayout() {
    this.layoutManager.place({
      id: `${this.id}-title`,
      x: 20, y: 20, width: 70, height: 60,
      parent: this.id
    });

    this.layoutManager.place({
      id: `${this.id}-edit`,
      x: 25, y: 80, width: 40, height: 25,
      parent: this.id
    });

    this.layoutManager.place({
      id: `${this.id}-view`,
      x: 65, y: 80, width: 40, height: 25,
      parent: this.id
    });
  }

  buildUI() {
    const title = new UIText({
      id: `${this.id}-title`,
      text: this.form.label || 'Untitled Form',
      fontSize: 0.05,
      color: '#000',
      align: 'left',
      valign: 'middle'
    });

    const editButton = new UIButton({
      id: `${this.id}-edit`,
      label: '✎',
      onClick: () => this.onEdit?.(this.form)
    });

    const viewButton = new UIButton({
      id: `${this.id}-view`,
      label: '📊',
      onClick: () => this.onView?.(this.form)
    });

    this.addChild(title);
    this.addChild(editButton);
    this.addChild(viewButton);
  }

  registerHitRegions(hitRegistry) {
    const editButton = this.getChildById(`${this.id}-edit`);
    const viewButton = this.getChildById(`${this.id}-view`);
  
    hitRegistry.register(`${this.id}-edit`, {
      plugin: this,
      region: 'button',
      box: editButton
    });
  
    hitRegistry.register(`${this.id}-view`, {
      plugin: this,
      region: 'button',
      box: viewButton
    });
  }
  
}
