import { UIElement } from "./UiElement.js";

export class UIButton extends UIElement {
  constructor({ id, label, onClick}) {
    super({ id });
    this.label = label;
    this.onClickHandler = onClick;
    this.type = 'uiButton';
    this.interactive = true;

  }

  onClick() {
    this.onClickHandler?.();
    console.log(`✅ Clicked: ${this.label}`);

  }

  render() {
    if (!this.visible) return;

    // Pick color based on interaction state
    let fill = '#007bff';
    if (this.isActive) fill = '#0056b3';
    else if (this.isHovered) fill = '#3399ff';

    // Focus outline
    const stroke = this.isFocused ? '#ffcc00' : '#004080';

    this.layoutRenderer.drawRect(this.id, {
      fill,
      stroke,
      lineWidth: this.isFocused ? 3 : 2
    });

    this.layoutRenderer.drawText(this.id, this.label, 0.01, {
      fill: '#fff',
      align: 'left',
      valign: 'middle'
    });
  }
  layout(canvasWidth, canvasHeight) {
   // super.layout(canvasWidth, canvasHeight);
  }
}

