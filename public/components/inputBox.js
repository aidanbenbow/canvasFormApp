export class UIInputBox {
    constructor({ id, layoutManager, layoutRenderer, value = '', placeholder = '', fontSize = 14 }) {
      this.id = id; // layout zone ID
      this.layout = layoutManager;
      this.renderer = layoutRenderer;
      this.value = value;
      this.placeholder = placeholder;
      this.fontSize = fontSize;
      this.focused = false;
      this.type = 'uiInputBox';
    }
  
    setValue(val) {
      this.value = val;
    }
  
    setFocus(state) {
      this.focused = state;
    }
  
    contains(x, y) {
      const bounds = this.layout.getScaledBounds(this.id, this.renderer.canvas.width, this.renderer.canvas.height);
      if (!bounds) return false;
      return x >= bounds.x && x <= bounds.x + bounds.width &&
             y >= bounds.y && y <= bounds.y + bounds.height;
    }
  
    render() {
        
      const bounds = this.layout.getScaledBounds(this.id, this.renderer.canvas.width, this.renderer.canvas.height);
      if (!bounds) return;
 
      // Draw input box background and border
      this.renderer.drawRect(this.id, {
        fill: '#FADCF6',
        stroke: this.focused ? '#007bff' : '#ccc',
        lineWidth: 2
      });
  
      // Draw input text or placeholder
      const text = this.value || (!this.focused ? this.placeholder : '');
      this.renderer.drawText(this.id, text, this.fontSize, {
        fill: '#000',
        align: 'left'
      });
    }
  }
  