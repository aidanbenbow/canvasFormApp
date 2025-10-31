import { UIElement } from './UiElement.js';
import { PopupKeyboard } from './keyBoard.js';

export class UIInputBox extends UIElement {
  constructor({ id, editorController, placeholder = '' }) {
    super({ id});
    this.editorController = editorController;
    this.placeholder = placeholder;
    this.type = 'uiInputBox';
    this.interactive = true;
this.visible = true;

  }

  // Focus the input box and notify controller
  onClick() {
    UIElement.setFocus(this);
    this.editorController.startEditing(this, 'text');
  }

  // Optional: lose focus
  onBlur() {
    super.onBlur();
    this.editorController.stopEditing();
  }
  layout(canvasWidth, canvasHeight) {
   // super.layout(canvasWidth, canvasHeight); // ✅ ensures children like keyboard are placed
  }
  

  render() {
    if (!this.visible) return;
   super.render();
    
    // Draw box background & border
    const fill = '#fff';
    const stroke = this.isFocused ? '#ffcc00' : '#000';
    this.layoutRenderer.drawRect(this.id, { fill, stroke, lineWidth: 2 });

    // Determine text to display
    const rawText = this.editorController.activeBox === this
  ? this.editorController.activeBox[this.editorController.activeField] ?? ''
  : '';

  const displayText = rawText || this.placeholder;
  const color = rawText ? '#000' : '#888';
  

    this.layoutRenderer.drawText(this.id, displayText, 0.01, { fill: color, align: 'left', valign: 'middle' });

    // Draw caret and selection if this box is active
    if (this.editorController.activeBox === this) {
      const ctx = this.layoutRenderer.ctx; // assuming layoutRenderer exposes canvas context
      this.editorController.drawSelection(ctx);
      this.editorController.drawCaret(ctx);
    }
  }
 
}
