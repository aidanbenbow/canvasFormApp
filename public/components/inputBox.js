import { UIElement } from './UiElement.js';
import { PopupKeyboard } from './keyBoard.js';

export class UIInputBox extends UIElement {
  constructor({ id, editorController, placeholder = '', label= '', interactive = true }) {
    super({ id});
    this.editorController = editorController;
    this.placeholder = placeholder;
    this.label = label;
    this.type = 'uiInputBox';
    this.text = '';
    this.interactive = interactive
this.visible = true;
this.draggable = false;

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
  updateText(newText) {
    this.text = newText;
    this.onChange?.(newText);
  }

  render() {
    if (!this.visible) return;
   super.render();
    
    // Draw box background & border
    const fill = '#fff';
    const stroke = this.isFocused ? '#ffcc00' : '#000';
    this.layoutRenderer.drawRect(this.id, { fill, stroke, lineWidth: 2 });

   this.layoutRenderer.drawText(this.id, this.label, 0.015, { fill: '#000', align: 'left', valign: 'top' });

    // Determine text to display
    const rawText = this.editorController.activeBox === this
  ? this.editorController.activeBox[this.editorController.activeField] ?? ''
  : '';

  const displayText = rawText || this.text;
  const color = rawText ? '#000' : '#888';

    this.layoutRenderer.drawText(this.id, displayText, 0.01, { fill: color, align: 'left', valign: 'middle' });

    // Draw caret and selection if this box is active
    if (this.editorController.activeBox === this) {
      const ctx = this.layoutRenderer.ctx; // assuming layoutRenderer exposes canvas context
      this.editorController.drawSelection(ctx);
      this.editorController.drawCaret(ctx);
    }
  }
  getText() {
    if (this.editorController.activeBox === this) {
      return this.editorController.activeBox[this.editorController.activeField] ?? '';
    }
    return '';
  }
  getValue() {
    return this.text
  }
 
}
