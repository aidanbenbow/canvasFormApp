import { UIElement } from './UiElement.js';
import { UiText } from './UiText.js';


export class UIOverlay extends UIElement {
  constructor({ id = 'uiOverlay', context, layoutManager, layoutRenderer }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.messageText = null;
    this.timeoutId = null;
  }

  showMessage({ text, color = '#000', duration = 4000, fontSize = 0.05 }) {
    if (this.messageText) {
      this.removeChild(this.messageText);
      this.messageText = null;
    }

    this.messageText = new UiText({
      id: `${this.id}_message`,
      text: text,
      context: this.context,
      layoutManager: this.layoutManager,
      layoutRenderer: this.layoutRenderer,
      fontSize: fontSize,
      color: color,
      align: 'center',
      valign: 'middle'
    });

    this.addChild(this.messageText);


 // Measure and layout overlay box
this.measure({ maxWidth: this.layoutManager.logicalWidth, maxHeight: this.layoutManager.logicalHeight });
this.layout(0, 0, this._measured.width, this._measured.height);


    this.context.pipeline.invalidate();

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.clear();
    }, duration);
  }

  clear() {
    if (this.messageText) {
      this.removeChild(this.messageText);
      this.messageText = null;
      this.context.pipeline.invalidate();
    }
  }
  render() {
    // Overlay might have a semi-transparent background in future
    // For now, just render children
    
    for (const child of this.children) {
      child.render();
    }
  }
  measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
    const { logicalWidth, logicalHeight } = this.layoutManager;
  
    // Ask the child to measure itself
    let textWidth = logicalWidth * 0.3;   // sensible default
    let textHeight = logicalHeight * 0.05;
  
    if (this.messageText) {
      const childSize = this.messageText.measure({
        maxWidth: constraints.maxWidth,
        maxHeight: constraints.maxHeight
      });
      textWidth = childSize.width;
      textHeight = childSize.height;
    }
  
    const padding = 20;
    const width = Math.min(constraints.maxWidth, textWidth + padding * 2);
    const height = Math.min(constraints.maxHeight, textHeight + padding * 2);
  
    this._measured = { width, height };
    return this._measured;
  }
  
  layout(x, y, width, height) {
    const { logicalWidth, logicalHeight } = this.layoutManager;
    const w = width || this._measured.width;
    const h = height || this._measured.height;
  
    // Center overlay box
    const cx = (logicalWidth - w) / 2;
    const cy = (logicalHeight - h) / 2;
  
    this.bounds = { x: cx, y: cy, width: w, height: h };
  
    // Layout children inside the box with padding
    const padding = 20;
    for (const child of this.children) {
      const m = child._measured || child.measure({ maxWidth: w, maxHeight: h });
const childX = cx + (w - m.width) / 2;
const childY = cy + (h - m.height) / 2;
child.layout(childX, childY, m.width, m.height);
    }
  }
}