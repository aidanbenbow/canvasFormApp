export class UIDropdown {
    constructor({ x, y, width, options, onSelect }) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.options = options;
      this.onSelect = onSelect;
      this.expanded = false;
    }
  
    render(ctx) {
      ctx.fillStyle = '#ccc';
      ctx.fillRect(this.x, this.y, this.width, 30);
      ctx.fillStyle = '#000';
      ctx.fillText('Select...', this.x + 10, this.y + 20);
      if (this.expanded) {
        this.options.forEach((opt, i) => {
          ctx.fillStyle = '#eee';
          ctx.fillRect(this.x, this.y + 30 + i * 30, this.width, 30);
          ctx.fillStyle = '#000';
          ctx.fillText(opt, this.x + 10, this.y + 50 + i * 30);
        });
      }
    }
  
    contains(x, y) {
      return x >= this.x && x <= this.x + this.width &&
             y >= this.y && y <= this.y + (this.expanded ? 30 + this.options.length * 30 : 30);
    }
  
    onClick(x, y) {
      if (!this.expanded) {
        this.expanded = true;
      } else {
        const index = Math.floor((y - this.y - 30) / 30);
        if (index >= 0 && index < this.options.length) {
          this.onSelect(this.options[index]);
          this.expanded = false;
        }
      }
    }
  }
  