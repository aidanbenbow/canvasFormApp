import { UIElement } from "./UiElement.js";

export class UIEditableText extends UIElement {
  constructor({ id, editor, text = '', fontSize = 0.04, color = '#000', align = 'left', valign = 'top' }) {
    super({ id });
    this.editorController = editor;
    this.text = text;
    this.fontSize = fontSize;
    this.color = color;
    this.align = align;
    this.valign = valign;
    this.interactive = true;
    this.visible = true;
  }

  onClick() {
    UIElement.setFocus(this);
    this.editorController.startEditing(this, 'text');
  }

  getValue() {
    return this.text;
  }

  updateText(newText) {
    this.text = newText;
    this.onChange?.(newText);
  }

  renderCaretAndSelection() {
    if (this.editorController?.activeBox === this) {
      const ctx = this.layoutRenderer.ctx;
      this.editorController.drawSelection(ctx);
      this.editorController.drawCaret(ctx);
    }
  }
}