import { UIElement } from './UiElement.js';

export class UITextArea extends UIElement {
  constructor({ id, layout,editorController, placeholder = '', onChange = () => {}, autoResize = true }) {
    super({ id });
    this.placeholder = placeholder;
    this.editorController = editorController;
    this.text = '';
    this.onChange = onChange;
    this.autoResize = autoResize;

    this.height = layout?.height || 60;
    this.width = layout?.width || 300;
    this.x = layout?.x || 0;
    this.y = layout?.y || 0;

    this.isFocused = false;
    this.lineHeight = 18;
    this.padding = 8;
  }

  onClick() {
    UIElement.setFocus(this);
    if(this.editorController){
      this.editorController.startEditing(this, 'text');
    }
  }
  updateText(newText) {
    this.text = newText;
    this.onChange(newText);
    if (this.autoResize) this.adjustHeight();
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  onKeyPress(char) {
    this.text += char;
    this.onChange(this.text);
    if (this.autoResize) this.adjustHeight();
  }

  onBackspace() {
    this.text = this.text.slice(0, -1);
    this.onChange(this.text);
    if (this.autoResize) this.adjustHeight();
  }

  adjustHeight() {
    const lines = this.text.split('\n').length;
    this.height = Math.max(this.height, lines * this.lineHeight + this.padding * 2);
    this.layoutManager.place({ id: this.id, x: this.x, y: this.y, width: this.width, height: this.height });
  }

  render() {
    if (!this.visible || !this.layoutRenderer) return;
  
    const style = {
      fill: '#fff',
      stroke: this.isFocused ? '#007bff' : '#ccc',
      lineWidth: 1
    };
  
    this.layoutRenderer.drawRect(this.id, style);
  
    const lines = this.text ? this.text.split('\n') : [this.placeholder];
    const bounds = this.layoutRenderer.getBounds(this.id);
    if (!bounds) return;
  
    const fontSize = 0.02;
    const padding = this.padding || 8;
    const lineHeight = this.lineHeight || 18;
  
    lines.forEach((line, i) => {
      this.layoutRenderer.drawText(this.id, line, fontSize, {
        fill: '#333',
        align: 'left',
        baseline: 'top',
        offsetY: padding + i * lineHeight
      });
    });
  }
  getValue() {
    return this.text;
  }
}