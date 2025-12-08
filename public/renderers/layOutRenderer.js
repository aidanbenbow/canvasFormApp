import { utilsRegister } from "../utils/register.js";

export class LayoutRenderer {
    constructor(layoutManager, canvas) {
      this.layout = layoutManager;
      this.canvas = canvas;
     
      this.ctx = canvas.getContext('2d');
     
    }
  
    // Draw a filled rectangle from layout
    drawRect(id, style = {}) {
     const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
  
      this.ctx.save();
      this.ctx.fillStyle = style.fill || '#000';
      this.ctx.fillRect(style.x, style.y, style.width, style.height);
      this.ctx.restore();
    
    }
  
    // Draw text from layout
    drawText(id, text, x,y, style = {}) {
      this.ctx.save();
      this.ctx.font = `${style.fontSize || 16}px Arial`;
    
      if (style.backgroundFill) {
        this.ctx.fillStyle = style.backgroundFill;
        this.ctx.fillRect(x, y, style.backgroundWidth || 0, style.backgroundHeight || 0);
      }
    
      this.ctx.fillStyle = style.fill || '#000';
      this.ctx.textAlign = style.align || 'left';
      this.ctx.textBaseline = style.valign || 'middle';
    
      this.ctx.fillText(text, x, y);
      this.ctx.restore();
    
    }

    getTextWidth(text, fontSize = 16) {
      const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
      this.ctx.save();
      this.ctx.font = getLogicalFontSize(fontSize, this.canvas.height);
      const metrics = this.ctx.measureText(text);
      this.ctx.restore();
      return metrics.width;
    }
  
    // Draw image from layout
    drawImage(id, image, style = {}) {
      const bounds = this.layout.getScaledBounds(id, this.canvas.width, this.canvas.height);
      if (!bounds || !image) return;
  
      this.ctx.save();
      this.ctx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.restore();
    }

    getBounds(id) {
      return this.layout.getScaledBounds(id, this.canvas.width, this.canvas.height);
    }
    
    drawDragOutline(id) {
      const bounds = this.layout.getScaledBounds(id, this.canvas.width, this.canvas.height);
      if (!bounds) return;
  
      this.ctx.save();
      this.ctx.strokeStyle = '#ff0000';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 3]);
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.restore();
    }
  
    // Clear canvas
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  