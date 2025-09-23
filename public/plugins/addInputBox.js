import { utilsRegister } from "../utils/register.js";



export class AddBoxPlugin {
    constructor({ ctx, logicalWidth, boxEditor, renderer, boxType = 'inputBox', yOffset = 10 }) {
      
  this.type = `add-${boxType}`;
  this.boxType = boxType;
      this.ctx = ctx;
      this.width = 140;
      this.height = 30;
      this.position = { x: logicalWidth - this.width - 120, y: yOffset }; // next to Save button
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
      const labelMap = {
        inputBox: '＋ Add Input Box',
        textBox: '＋ Add Text Box',
        imageBox: '＋ Add Image Box'
      }
      ctx.fillText(labelMap[this.boxType], this.position.x + 10, this.position.y + 20);
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
        const canvasSize = utilsRegister.get('canvas', 'getCanvasSize')();
const scaleToCanvas = utilsRegister.get('layout', 'scaleToCanvas');

const logicalPos = { x: 100, y: 100 };
const scaledPos = scaleToCanvas(logicalPos, canvasSize.width, canvasSize.height);

const boxConfig = {
  type: this.boxType,
  label: this.boxType === 'imageBox' ? 'Send' : (this.boxType === 'inputBox' ? 'Input' : 'Text'),
  text: this.boxType === 'textBox' ? 'Some static text' : ' ',
  startPosition: scaledPos,
  size: { width: 120, height: 40 },
  fill: '#ffffff',
  id: `${this.boxType}-${Date.now()}`,
  color: '#ffff00',
  action: this.boxType === 'imageBox' ? 'sendButton' : 'writeText',
  imageKey: this.boxType === 'imageBox' ? "button-unpushed" : undefined // optional
};


        const newBox = createBox(boxConfig, this.renderer);
  
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