import { UIElement } from './UiElement.js';

export class UIInputBox extends UIElement {
  constructor({ id, layoutManager, layoutRenderer, editorController, placeholder = '' }) {
    super({ id, layoutManager, layoutRenderer });
    this.editorController = editorController;
    this.placeholder = placeholder;
    this.type = 'uiInputBox';
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

  render() {
    if (!this.visible) return;

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
  

    this.layoutRenderer.drawText(this.id, displayText, 16, { fill: color, align: 'left', valign: 'middle' });

    // Draw caret and selection if this box is active
    if (this.editorController.activeBox === this) {
      const ctx = this.layoutRenderer.ctx; // assuming layoutRenderer exposes canvas context
      this.editorController.drawSelection(ctx);
      this.editorController.drawCaret(ctx);
    }
  }
}

// export class UIInputBox {
//     constructor({ id, layoutManager, layoutRenderer, value = '', placeholder = '', fontSize = 14 }) {
//       this.id = id; // layout zone ID
//       this.layout = layoutManager;
//       this.renderer = layoutRenderer;
//       this.value = value;
//       this.placeholder = placeholder;
//       this.fontSize = fontSize;
//       this.focused = false;
//       this.type = 'uiInputBox';
//     }
  
//     setValue(val) {
//       this.value = val;
//     }
  
//     setFocus(state) {
//       this.focused = state;
//     }
  
//     contains(x, y) {
//       const bounds = this.layout.getScaledBounds(this.id, this.renderer.canvas.width, this.renderer.canvas.height);
//       if (!bounds) return false;
//       return x >= bounds.x && x <= bounds.x + bounds.width &&
//              y >= bounds.y && y <= bounds.y + bounds.height;
//     }
  
//     render() {
        
//       const bounds = this.layout.getScaledBounds(this.id, this.renderer.canvas.width, this.renderer.canvas.height);
//       if (!bounds) return;
 
//       // Draw input box background and border
//       this.renderer.drawRect(this.id, {
//         fill: '#FADCF6',
//         stroke: this.focused ? '#007bff' : '#ccc',
//         lineWidth: 2
//       });
  
//       // Draw input text or placeholder
//       const text = this.value || (!this.focused ? this.placeholder : '');
//       this.renderer.drawText(this.id, text, this.fontSize, {
//         fill: '#000',
//         align: 'left'
//       });
//     }
//   }
  