import { UIElement } from './UiElement.js';
import { UIText } from './text.js';

export class UIOverlay extends UIElement {
  constructor({ id = 'uiOverlay', context, layoutManager, layoutRenderer }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.messageText = null;
    this.timeoutId = null;
  }

  showMessage({ text, color = '#000', duration = 2000, fontSize = 0.05 }) {
    if (this.messageText) {
      this.removeChild(this.messageText);
      this.messageText = null;
    }

    this.messageText = new UIText({
      id: `${this.id}-message`,
      text,
      fontSize,
      color,
      align: 'center',
      valign: 'middle',
      context: this.context,
      layoutManager: this.layoutManager,
      layoutRenderer: this.layoutRenderer
    });

    this.addChild(this.messageText);

    this.layoutManager.place({
      id: this.messageText.id,
      x: 200,
      y: 150,
      width: 400,
      height: 100
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
}