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
    
        this.layoutManager.place({
            id: labelId,
            x: 0,
            y: 0,
            width: 400,
            height: 20,
            parent: this.id
        });
    
        this.layoutManager.place({
            id: inputId,
            x: 0,
            y: 25,
            width: 400,
            height: 30,
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