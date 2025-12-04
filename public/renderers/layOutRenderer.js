import { utilsRegister } from "../utils/register.js";

export class LayoutRenderer {
    constructor(layoutManager, canvas) {
      this.layout = layoutManager;
      this.canvas = canvas;
     
      this.ctx = canvas.getContext('2d');
     
    }
  
    // Draw a filled rectangle from layout
    drawRect(id, style = {}) {
     
      const bounds = this.layout.getScaledBounds(id, this.canvas.width, this.canvas.height);
      if (!bounds) return;

      this.ctx.save();
      this.ctx.fillStyle = style.fill || '#000';
      this.ctx.strokeStyle = style.stroke || '#000';
      this.ctx.lineWidth = style.lineWidth || 1;
  
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      if (style.stroke) {
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
      
      this.ctx.restore();
    }
  
    // Draw text from layout
    drawText(id, text, fontSize = 16, style = {}) {
     
      const bounds = this.layout.getScaledBounds(id, this.canvas.width, this.canvas.height);
      if (!bounds) return;
   
      this.ctx.save();
      this.ctx.font = `${Math.round((fontSize) * this.canvas.height)}px Arial`
      
      this.ctx.fillStyle = style.backgroundFill || null;
      if (style.backgroundFill) {
        this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
      
      this.ctx.fillStyle = style.fill || '#000';
      this.ctx.textAlign = style.align || 'left';
      this.ctx.textBaseline = style.valign || 'middle';

let textX = bounds.x;
if (this.ctx.textAlign === 'center') {
  textX = bounds.x + bounds.width / 2;
} else if (this.ctx.textAlign === 'right') {
  textX = bounds.x + bounds.width;
}

let textY = bounds.y + bounds.height / 2;
if (this.ctx.textBaseline === 'top') {
  textY = bounds.y-5;
} else if (this.ctx.textBaseline === 'bottom') {
  textY = bounds.y + bounds.height;
} 
// if(style.valign === 'above') {
//   textY = bounds.y - 5; // 5 pixels above the top
// }

  this.ctx.fillText(text, textX, textY);
  
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
  