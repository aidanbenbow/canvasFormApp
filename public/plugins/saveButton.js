export class SaveButtonPlugin {
    constructor({ ctx, onSave, logicalWidth, boxes }) {
      this.type = 'saveButton';
      this.ctx = ctx;
      this.onSave = onSave;
      this.width = 100;
      this.height = 30;
      this.position = { x: logicalWidth - this.width-10, y: 10 };
      this.boxes = boxes; // Reference to boxes to save
      
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
        this.onSave(this.boxes.getBoxes()); // Trigger save logic
      }
    }
    getHitHex() {
      return 'save-001';
    }
  
    getHitColor() {
      return '#ff0001';
    }
  
    registerHitRegion(hitRegistry) {
      hitRegistry.register(this.getHitHex(), {
        type: this.type,
        plugin: this,
        bounds: this.position
      });
    }
  
    drawHitRegion(hitCtx) {
      hitCtx.fillStyle = this.getHitColor();
      hitCtx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  
  }