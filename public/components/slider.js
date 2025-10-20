export class UISlider {
    constructor({ x, y, width, min = 0, max = 100, value = 50 }) {
      Object.assign(this, { x, y, width, min, max, value });
      this.height = 30;
      this.thumbRadius = 8;
    }
  
    render(ctx) {
      const thumbX = this.x + ((this.value - this.min) / (this.max - this.min)) * this.width;
      ctx.fillStyle = '#ccc';
      ctx.fillRect(this.x, this.y + this.height / 2 - 2, this.width, 4);
      ctx.beginPath();
      ctx.arc(thumbX, this.y + this.height / 2, this.thumbRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#007bff';
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillText(`${this.value}`, this.x + this.width + 10, this.y + this.height / 2 + 5);
    }
  
    getThumbX() {
      return this.x + ((this.value - this.min) / (this.max - this.min)) * this.width;
    }
  
    contains(x, y) {
      const dx = x - this.getThumbX();
      const dy = y - (this.y + this.height / 2);
      return dx * dx + dy * dy <= this.thumbRadius * this.thumbRadius;
    }
  
    setValueFromX(x) {
      const clampedX = Math.max(this.x, Math.min(x, this.x + this.width));
      const ratio = (clampedX - this.x) / this.width;
      this.value = Math.round(this.min + ratio * (this.max - this.min));
    }
  }
  