import { UIEditableText } from "./UiEditableText.js";

export class UIInput extends UIEditableText {
    constructor({ id, editor, placeholder = '',label= '', context, layoutManager, layoutRenderer }) {
        super({ id, editor, text: '',label,placeholder, context, layoutManager, layoutRenderer });
        this.type = 'input';
        this.draggable = false;
    }
   render() {
    super.render();

    // 3. Label
    if (this.label) {
      const bounds = this.getScaledBounds();
      const labelHeightPx = this.fontSize * this.layoutRenderer.canvas.height * 0.8;
        const labelY = bounds.y - labelHeightPx;


       this.layoutRenderer.drawText(
         `${this.id}`,
         this.label,
         bounds.x,
          labelY,
         { fill: '#000', align: 'left', valign: 'top', 
           fontSize: labelHeightPx
          }
       );
     }
    
   }
   getHeight() {
    return this._measured?.height || 0;
  }

  updateText(newText) {
    super.updateText(newText);
    if (this.parent) {
      this.parent.invalidate();
    }
  }

  measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
    const canvas = this.layoutRenderer?.canvas;
    const ctx = this.layoutRenderer?.ctx;
    if (!ctx || !canvas) {
      this._measured = { width: 0, height: 0 };
      return this._measured;
    }
  
    // Scale font size into pixels relative to canvas height
    const fontPx = this.fontSize * canvas.height;
  
    // Measure text or placeholder width
    const displayText = this.text || this.placeholder || "";
    ctx.save();
    ctx.font = `${fontPx}px Arial`;
    const metrics = ctx.measureText(displayText);
    ctx.restore();
  
    const textWidth = metrics.width;
    const textHeight = fontPx * 1.2; // approximate line height
  
    // Label height if present
    const labelHeight = this.label ? fontPx * 0.8 : 0;
  
    // Add padding
    const paddingX = 16;
    const paddingY = 8;
    const minWidth = 100;

    // 🔹 Clamp to constraints.maxWidth so it never exceeds scroll container width
    const width = Math.min(
      constraints.maxWidth,
      Math.max(minWidth, textWidth + paddingX * 2)
    );
    const height = Math.min(
      constraints.maxHeight,
      textHeight + paddingY * 2 + labelHeight
    );
  
  
    this._measured = { width, height };
    return this._measured;
  }

}