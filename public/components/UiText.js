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
}