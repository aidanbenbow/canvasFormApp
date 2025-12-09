import { UIElement } from "./UiElement.js";

export class UIEditableText extends UIElement {
  constructor({ id, editor, text = '',label='',placeholder='', fontSize = 0.04, color = '#000',bgColor='#fff', align = 'left', valign = 'bottom', context, layoutManager, layoutRenderer }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.editorController = editor;
    this.text = text;
    this.label = label;
    this.placeholder = placeholder;
    this.fontSize = fontSize;
    this.bgColor = bgColor;
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

    // Force re‑measure and re‑layout
  if (this.layoutManager && this.context?.pipeline) {
    this.measure({ maxWidth: this.layoutManager.logicalWidth, maxHeight: this.layoutManager.logicalHeight });
    this.layout(this.bounds?.x || 0, this.bounds?.y || 0, this._measured.width, this._measured.height);
    this.context.pipeline.invalidate();
  }

  }
  render() {
    if (!this.visible) return;

    const bounds = this.getScaledBounds();
    if (bounds && this.layoutRenderer?.ctx) {
      const ctx = this.layoutRenderer.ctx;

      // 1. Background first
      ctx.save();
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();

      // 2. Border
      ctx.save();
      ctx.strokeStyle = this.isFocused ? '#ffcc00' : '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
    }

   

    // 4. Value or placeholder
    
    const displayText = this.text || this.placeholder;
    const color = this.text ? this.color : '#888';
    const fontPx = this.fontSize * this.layoutRenderer.canvas.height;
    const y = this.valign === 'top'
  ? bounds.y + fontPx
  : this.valign === 'middle'
    ? bounds.y + bounds.height / 2
    : bounds.y + bounds.height - 4;
    this.layoutRenderer.drawText(
      `${this.id}`,
      displayText,
      bounds.x + 8,
      y,
      { fill: color, align: this.align, valign: this.valign
      , fontSize: fontPx }
    );

    // 5. Caret/selection
    this.renderCaretAndSelection();
  }

  renderCaretAndSelection() {
    if (this.editorController?.activeBox === this) {
      const ctx = this.layoutRenderer.ctx;
      this.editorController.drawSelection(ctx);
      this.editorController.drawCaret(ctx);
    }
  }
}