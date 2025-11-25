import { UIElement } from "./UiElement.js";

export class UIButton extends UIElement {
  constructor({ id, label, color = '#007bff', onClick, context, layoutManager, layoutRenderer }) {   
    super({ id, context, layoutManager, layoutRenderer });
    this.label = label;
    this.onClickHandler = onClick;
    this.type = 'button';
    this.interactive = true;
    this.colour = color;
   
    this.draggable = true
  }

  onClick() {
    console.log(`Button ${this.id} clicked.`);
    UIElement.setFocus(this);
    this.onClickHandler?.();
  }

  render() {
    if (!this.visible) return;

    // Pick color based on interaction state
    let fill = this.colour;
    if (this.isFocused) fill = '#0056b3';
    else if (this.isActive) fill = '#004080';
    else if (this.isHovered) fill = '#0069d9';

    // Focus outline
    const stroke = this.isFocused ? '#ffcc00' : '#004080';

    this.layoutRenderer.drawRect(this.id, {
      fill,
      stroke,
      lineWidth: this.isFocused ? 3 : 2
    });

    this.layoutRenderer.drawText(this.id, this.label, 0.02, {
      fill: '#fff',
      align: 'left',
      valign: 'middle'
    });
  
  }
  layout(canvasWidth, canvasHeight) {
   // super.layout(canvasWidth, canvasHeight);
  }
}

