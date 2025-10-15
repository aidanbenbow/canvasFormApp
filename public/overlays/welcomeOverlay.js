import { utilsRegister } from "../utils/register.js";

export class WelcomeOverlay {
    constructor({ ctx }) {
      this.ctx = ctx;
      this.canvasWidth = this.ctx.canvas.width;
        this.canvasHeight = this.ctx.canvas.height;
      this.type = 'loginPlugin';
      this.isOverlay = true;
   
    }
  
    render() {
        const scaleToCanvas = utilsRegister.get('layout', 'scaleToCanvas');
    const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
      this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${getLogicalFontSize(34, this.canvasHeight)}px Arial`;
        this.ctx.textAlign = 'center';
        const titlePos = scaleToCanvas({ x: 400, y: 200 }, this.canvasWidth, this.canvasHeight);
        this.ctx.fillText('Welcome to the Collaborative Editor', titlePos.x, titlePos.y);
        this.ctx.font = `${getLogicalFontSize(26, this.canvasHeight)}px Arial`;
        const subtitlePos = scaleToCanvas({ x: 400, y: 240 }, this.canvasWidth, this.canvasHeight);
        this.ctx.fillText('Please log in to continue', subtitlePos.x, subtitlePos.y);
        this.ctx.restore();
    }
  }
  