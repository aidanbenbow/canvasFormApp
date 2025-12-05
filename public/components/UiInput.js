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
      const labelY = bounds ? bounds.y - this.fontSize * 1.2 : 0;
       this.layoutRenderer.drawText(
         `${this.id}`,
         this.label,
         this.fontSize * 0.8,
         { fill: '#000', align: 'left', valign: 'top', x: bounds.x, y: labelY }
       );
     }
    
   }
   getHeight(){
    const bounds = this.getScaledBounds();
    const labelHeight = this.label ? this.fontSize * 1.2 : 0;
    return bounds ? bounds.height + labelHeight : 0
   }
}