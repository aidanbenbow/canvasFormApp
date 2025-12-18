import { UIElement } from "./UiElement.js";

export class UIButton extends UIElement {
  constructor({ id, label, color = '#007bff', onClick, context}) {   
    super({ id, context });
    this.label = label;
    this.onClickHandler = onClick;
    this.type = 'button';
    this.interactive = true;
    this.colour = color;
   
    this.draggable = false
    this.focusable = true
  }

  onClick() {
    console.log(`Button ${this.id} clicked.`);
    console.log(this.onClickHandler)
    if (this.focusable) {
      UIElement.setFocus(this);
    }
  
    this.onClickHandler?.();
  }

  render() {
    if (!this.visible) return;
    const canvas = this.layoutRenderer?.canvas;
const scaled = this.getScaledBounds(canvas?.width, canvas?.height);
    // Pick color based on interaction state
    let fill = this.colour;
    if (this.isFocused) fill = '#0056b3';
    else if (this.isActive) fill = '#004080';
    else if (this.isHovered) fill = '#0069d9';

    // Focus outline
    const stroke = this.isFocused ? '#ffcc00' : '#004080';

    this.layoutRenderer.drawRect(this.id, {
      x: scaled.x,
      y: scaled.y,
      width: scaled.width,
      height: scaled.height,
      fill,
      stroke,
      lineWidth: this.isFocused ? 3 : 2
    });

    this.layoutRenderer.drawText(this.id, this.label, 
      scaled.x+12,scaled.y+scaled.height/2, {
      fill: '#fff',
      align: 'left',
      valign: 'middle'
    });
  
  }
measure(constraints={maxWidth: Infinity, maxHeight: Infinity}) {
  const ctx = this.context.ctx
  let textHeight = 16
  let textWidth = 0
  if(ctx){
    const metrics = ctx.measureText(this.label);
    textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    textWidth = metrics.width;
  } else{
    textWidth = this.label.length * 10; // Approximate width
  }

  const padding = 10
  const measuredWidth = Math.min(textWidth + padding*2, constraints.maxWidth)
  const measuredHeight = Math.min(textHeight + padding*2, constraints.maxHeight)
  
  this._measured = {
    width: measuredWidth,
    height: measuredHeight
  }
  
  return this._measured;
}

  layout(x, y, width, height) {
    const w = width || this._measured.width;
    const h = height || this._measured.height;
    this.bounds = { x, y, width: w, height: h };
  }
}

