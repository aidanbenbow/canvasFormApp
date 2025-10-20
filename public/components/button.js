export class UIButton {
    constructor({ x, y, width, height, label, onClick }) {
      Object.assign(this, { x, y, width, height, label, onClick });
    }
  
    render(ctx) {
      ctx.fillStyle = '#007bff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#fff';
      ctx.fillText(this.label, this.x + 10, this.y + 25);
    }
  
    contains(x, y) {
      return x >= this.x && x <= this.x + this.width &&
             y >= this.y && y <= this.y + this.height;
    }
  }
  