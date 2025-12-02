import { UIEditableText } from "./UiEditableText.js";


export class UiText extends UIEditableText {
  constructor({ id, text, fieldRef, editor, context, layoutManager, layoutRenderer, fontSize = 0.04, color = '#000',bgColor='rgba(1,1,1,0.1)', align = 'left', valign = 'top', placeholder='' }) {
    super({ id,editor, text,label:text,placeholder, fontSize, color,bgColor, align, valign,context, layoutManager, layoutRenderer,  });
    this.fieldRef = fieldRef;
    this.type = 'text';
    this.draggable = true;
    console.log('UiText created with text:', text);
   
  }

  render() {
    super.render();
     // 3. Label
     if (this.label) {
        console.log('Rendering label:', this.label);
        this.layoutRenderer.drawText(
          `${this.id}`,
          this.label,
          this.fontSize * 0.8,
          { fill: '#000', align: 'left', valign: 'top' }
        );
      }
    }

  updateText(newText) {
   super.updateText(newText);
    if (this.fieldRef) {
      this.fieldRef.label = newText;
    }
  }
}