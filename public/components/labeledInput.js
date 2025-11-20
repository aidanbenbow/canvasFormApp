import { UIElement } from "./UiElement.js";
import { UIInputBox } from "./inputBox.js";
import { UIText } from "./text.js";


export class LabeledInput extends UIElement{
constructor({ id, editor,context, layoutManager, layoutRenderer, label = 'new input', inputType = 'text', value = '', onChange = null }) {
    super({ id,context, layoutManager, layoutRenderer });
    this.type = 'input';
    this.label2 = label;
    this.labelElement = null;
    this.inputType = inputType;
    this.editorController = editor;
   this.draggable = false
   this.inputElement = null;
    this.value = value;
    this.onChange = onChange;
    this.buildLayout();
  }
    buildLayout(){
        const labelId = `${this.id}-label`;
        const inputId = `${this.id}-input`;
    
const labelHeight = 16;
const inputHeight = 28;
const verticalSpacing = 4;
const labelOffset = 2;

        this.layoutManager.place({
            id: labelId,
            x: 0,
            y: labelOffset,
            width: 400,
            height: labelHeight,
            parent: this.id
        });
    
        this.layoutManager.place({
            id: inputId,
            x: 0,
            y: labelHeight + verticalSpacing,
            width: 400,
            height: inputHeight,
            parent: this.id
        });

       this.labelElement = new UIText({
            id: labelId,
            text: this.label2,
            editor: this.editorController,
        });
        this.addChild(this.labelElement);
        this.inputElement = new UIInputBox({
            id: inputId,
            editor: this.editorController,
           interactive: true,   
        });
        this.addChild(this.inputElement);

    }
    getValue() {
        return this.inputElement.getValue();
    }
}