export class UIInputController {
    constructor(inputBox, onChange) {
      this.inputBox = inputBox;
      this.onChange = onChange;
    }
  
    pointerDown(x, y) {
      const isInside = this.inputBox.contains(x, y);
      this.inputBox.setFocus(isInside);
    }
  
    keyPress(key) {
      if (!this.inputBox.focused) return;
  
      if (key === 'Backspace') {
        this.inputBox.setValue(this.inputBox.value.slice(0, -1));
      } else if (key.length === 1) {
        this.inputBox.setValue(this.inputBox.value + key);
      }
  
      this.onChange?.(this.inputBox.value);
    }
  
    blur() {
      this.inputBox.setFocus(false);
    }
  }
  