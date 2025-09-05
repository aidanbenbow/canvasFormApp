export class SaveButtonPlugin {
    constructor({ ctx, onSave, logicalWidth }) {
      this.type = 'saveButton';
      this.ctx = ctx;
      this.onSave = onSave;
      this.width = 100;
      this.height = 30;
      this.position = { x: logicalWidth - this.width-10, y: 10 };
    }
  
    render({ ctx }) {
      ctx.save();
      ctx.fillStyle = '#28a745'; // green
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText('Save', this.position.x + 25, this.position.y + 20);
      ctx.restore();
    }
  
    handleClick(x, y) {
      const withinBounds =
        x >= this.position.x &&
        x <= this.position.x + this.width &&
        y >= this.position.y &&
        y <= this.position.y + this.height;
  
      if (withinBounds && typeof this.onSave === 'function') {
        this.onSave(); // Trigger save logic
      }
    }
  }