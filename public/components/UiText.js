import { UIEditableText } from "./UiEditableText.js";


export class UiText extends UIEditableText {
  constructor({ id, text, fieldRef, editor, context, layoutManager, layoutRenderer, fontSize = 0.04, color = '#000',bgColor='rgba(1,1,1,0.1)', align = 'left', valign = 'top', placeholder='' }) {
    super({ id,editor, text,label:text,placeholder, fontSize, color,bgColor, align, valign,context, layoutManager, layoutRenderer,  });
    this.fieldRef = fieldRef;
    this.type = 'text';
    this.draggable = true;
   
  }
  updateText(newText) {
   super.updateText(newText);
    if (this.fieldRef) {
      this.fieldRef.label = newText;
    }
  }
  // 🔹 New measure method
  measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
    const canvas = this.layoutRenderer?.canvas;
    const ctx = this.layoutRenderer?.ctx;
    if (!ctx || !canvas) {
      this._measured = { width: 0, height: 0 };
      return this._measured;
    }

    // Scale font size into pixels relative to canvas height
    const fontPx = this.fontSize * canvas.height;
    ctx.save();
    ctx.font = `${fontPx}px Arial`;
    const metrics = ctx.measureText(this.text || this.placeholder || "");
    ctx.restore();

    const textWidth = metrics.width;
    const textHeight = fontPx * 1.2; // approximate line height

    const width = Math.min(constraints.maxWidth, textWidth);
    const height = Math.min(constraints.maxHeight, textHeight);

    this._measured = { width, height };
    return this._measured;
  }

}