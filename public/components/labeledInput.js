import { UIElement } from "./UiElement.js";
import { UIInputBox } from "./inputBox.js";
import { UIText } from "./text.js";


export class LabeledInput extends UIElement{
constructor({ id, editor, layoutManager, layoutRenderer, label = 'new input', inputType = 'text', value = '', onChange = null }) {
    super({ id, layoutManager, layoutRenderer });
    this.label = label;
    this.inputType = inputType;
    this.editorController = editor;
   
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

        const labelElement = new UIText({
            id: labelId,
            text: this.label,
            editor: this.editorController,
        });
        this.addChild(labelElement);
        const inputElement = new UIInputBox({
            id: inputId,
            editor: this.editorController,
           interactive: false,   
        });
        this.addChild(inputElement);

    }
}