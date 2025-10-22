import { UIElement } from './UiElement.js';

export class UIText extends UIElement {
  constructor({ id, text, fontSize = 16, color = '#000', layoutManager, layoutRenderer, align = 'left', valign = 'top' }) {
    super({ id, layoutManager, layoutRenderer });
    this.text = text;
    this.fontSize = fontSize;
    this.color = color;
    this.align = align;
    this.valign = valign;
  }

  render() {
    if (!this.visible) return;

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
  }
}