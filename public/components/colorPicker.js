export class UIColorPicker {
    constructor({ x, y, width, height, colors = [], selected = null }) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.colors = colors;
      this.selected = selected;
      this.cellSize = 30;
      this.padding = 10;
    }
  
    render(ctx) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#000';
      ctx.fillText('Pick a color:', this.x, this.y - 10);
  
      this.colors.forEach((color, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const cx = this.x + col * (this.cellSize + this.padding);
        const cy = this.y + row * (this.cellSize + this.padding);
  
        ctx.fillStyle = color;
        ctx.fillRect(cx, cy, this.cellSize, this.cellSize);
  
        if (color === this.selected) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx - 2, cy - 2, this.cellSize + 4, this.cellSize + 4);
        }
      });
    }
  
    getColorAt(x, y) {
      for (let i = 0; i < this.colors.length; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const cx = this.x + col * (this.cellSize + this.padding);
        const cy = this.y + row * (this.cellSize + this.padding);
  
        if (
          x >= cx &&
          x <= cx + this.cellSize &&
          y >= cy &&
          y <= cy + this.cellSize
        ) {
          return this.colors[i];
        }
      }
      return null;
    }
  }
  