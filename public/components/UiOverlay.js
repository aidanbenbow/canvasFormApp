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

    // ✅ Get stage size from layoutManager
  const { logicalWidth, logicalHeight } = this.layoutManager;

  const boxWidth = 400;
  const boxHeight = 100;

  this.layoutManager.place({
    id: this.messageText.id,
    x: (logicalWidth - boxWidth) / 2,   // center horizontally
    y: (logicalHeight - boxHeight) / 2, // center vertically
    width: boxWidth,
    height: boxHeight
  });

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
}