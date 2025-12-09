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

   measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
    // Base input height in logical units
    const baseHeight = 30;
    const labelHeight = this.label ? 20 : 0;


    const width = Math.min(constraints.maxWidth, 200);
    const height = Math.min(constraints.maxHeight, baseHeight + labelHeight);

    this._measured = { width, height };
    return this._measured;
  }

}