import { UIElement } from './UiElement.js';

export class UIText extends UIElement {
  constructor({ id, text, editor, context, layoutManager,layoutRenderer, fontSize = 0.04, color = '#000', align = 'left', valign = 'top', onClick }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.text = text;
    this.editorController = editor;
    this.fontSize = fontSize;
    this.color = color;
    this.bgColor = null;
    this.align = align;
    this.valign = valign;
    this.type = 'text';
    this.interactive = true;
    this.draggable = true
    this.onClickHandler = onClick;
    this.isSelected = false;
  }

  onClick() {
    UIElement.setFocus(this);
    this.onClickHandler?.();
    this.editorController.startEditing(this, 'text');
  }
  setStyle({ color, bgColor, fontSize, align, valign }) {
    if (color) this.color = color;
    if (bgColor) this.bgColor = bgColor;
    if (fontSize) this.fontSize = fontSize;
    if (align) this.align = align;
    if (valign) this.valign = valign;
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
        backgroundFill: this.bgColor,
        align: this.align,
        valign: this.valign
      }
    );

    if(this.editorController?.activeBox === this) {
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
    this.label = newText;
    this.onChange?.(newText);
  }
}