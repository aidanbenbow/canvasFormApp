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
  
      const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
      this.ctx.save();
      this.ctx.font = getLogicalFontSize(fontSize, this.canvas.height);
      this.ctx.fillStyle = style.fill || '#000';
      this.ctx.textAlign = style.align || 'left';
      this.ctx.fillText(text, bounds.x, bounds.y + fontSize); // Adjust Y for baseline
      this.ctx.restore();
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
    
  
    // Clear canvas
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  