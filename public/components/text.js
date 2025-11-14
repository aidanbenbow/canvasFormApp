import { UIElement } from './UiElement.js';

export class UIText extends UIElement {
  constructor({ id, text, editor, fontSize = 0.04, color = '#000', align = 'left', valign = 'top' }) {
    super({ id});
    this.text = text;
    this.editorController = editor;
    this.fontSize = fontSize;
    this.color = color;
    this.align = align;
    this.valign = valign;
    this.type = 'uiText';
    this.interactive = true;
    this.draggable = true
  }

  onClick() {
    UIElement.setFocus(this);
    this.editorController.startEditing(this, 'text');
  }

  render() {
    if (!this.visible) return;
this.renderDragHighlight();
    this.layoutRenderer.drawText(
      this.id,
      this.text,
      this.fontSize,
      {
        fill: this.color,
        align: this.align,
        valign: this.valign
      }
    );

    if(this.editorController.activeBox === this) {
      const ctx = this.layoutRenderer.ctx; // assuming layoutRenderer exposes canvas context
      this.editorController.drawSelection(ctx);
      this.editorController.drawCaret(ctx);
    }
  }
  getValue() {
    return this.text;
  }
  updateText(newText) {
    this.text = newText;
    this.onChange?.(newText);
  }
}