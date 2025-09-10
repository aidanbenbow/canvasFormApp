import { utilsRegister } from "../utils/register.js";

export class AddInputBoxPlugin {
    constructor({ ctx, logicalWidth, boxEditor, renderer }) {
      this.type = 'addInputBox';
      this.ctx = ctx;
      this.width = 140;
      this.height = 30;
      this.position = { x: logicalWidth - this.width - 120, y: 10 }; // next to Save button
      this.boxEditor = boxEditor;
      this.renderer = renderer.renderManager;
      this.pipeline = renderer;
    }
  
    render({ ctx }) {
      ctx.save();
      ctx.fillStyle = '#007bff'; // blue
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText('➕ Add Input Box', this.position.x + 10, this.position.y + 20);
      ctx.restore();
    }
  
    handleClick(x, y) {
      const withinBounds =
        x >= this.position.x &&
        x <= this.position.x + this.width &&
        y >= this.position.y &&
        y <= this.position.y + this.height;
  
      if (withinBounds) {
        const createBox = utilsRegister.get('box', 'createBoxFromFormItem');
        const newBox = createBox({
          type: 'inputBox',
          label: 'New Input',
          text: ' ',
          startPosition: { x: 100, y: 100 },
          size: { width: 120, height: 40 },
          fill: '#ffffff',
          id: `input-${Date.now()}`,
          color: '#ffff00',
            action: 'writeText',
        }, this.renderer);
  
        this.boxEditor.addBox(newBox);
        this.pipeline.add(newBox);
        this.pipeline.invalidate();
      }
    }
  
    getHitHex() {
      return 'add-input-001';
    }
  
    getHitColor() {
      return '#0000ff'; // unique hit color
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