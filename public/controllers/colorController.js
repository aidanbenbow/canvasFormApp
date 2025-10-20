export class UIColorPickerController {
    constructor(picker, onChange) {
      this.picker = picker;
      this.onChange = onChange;
    }
  
    pointerDown(x, y) {
      const color = this.picker.getColorAt(x, y);
      if (color && color !== this.picker.selected) {
        this.picker.selected = color;
        this.onChange?.(color);
      }
    }
  }
  