export class UISliderController {
    constructor(slider, onChange) {
      this.slider = slider;
      this.onChange = onChange;
      this.dragging = false;
    }
  
    pointerDown(x, y) {
      if (this.slider.contains(x, y)) {
        this.dragging = true;
      }
    }
  
    pointerMove(x, y) {
      if (!this.dragging) return;
      const oldValue = this.slider.value;
      this.slider.setValueFromX(x);
      if (this.slider.value !== oldValue) {
        this.onChange?.(this.slider.value);
      }
    }
  
    pointerUp() {
      this.dragging = false;
    }
  }
  