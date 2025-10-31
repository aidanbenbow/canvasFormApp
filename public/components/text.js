import { UIElement } from './UiElement.js';

export class UIText extends UIElement {
  constructor({ id, text, fontSize = 0.04, color = '#000', align = 'left', valign = 'top' }) {
    super({ id});
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