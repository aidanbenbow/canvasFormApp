
import { CaretController } from "./caretController.js";
import { KeyBoardInputController } from "./keyBoardInputController.js";
import { keyboardController } from "./keyboardController.js";
import { TextModel } from "./textModel.js";

export class TextEditorController {
    constructor(pipeline,popup) {
        this.activeBox = null;
        this.activeField = null; // Not used in this controller, but kept for consistency
        this.caretIndex = 0;
        this.blinkState = true;
        this.pipeline = pipeline;
  this.popup = popup
 
        this.keyboardController = new keyboardController(pipeline, this.popup);
        this.textModel = null
        this.keyboardInput = new KeyBoardInputController(this);
        this.caretController = new CaretController(this);
       
        this.initCaretBlink();
      
    }

    
    startEditing(box, field = 'text') {
        this.activeBox = box;
        this.activeField = field;

       //Initialize the text model with the box’s current value
  const initialValue = box.getValue?.() || '';
  this.textModel = new TextModel(this);     // re‑create or reset model
  this.textModel.setText(initialValue);     // ensure buffer is populated
  
      this.caretController.setCaretToEnd(initialValue);
      this.keyboardInput.enable();
       this.keyboardController.showKeyboard();

        this.pipeline.invalidate();
      }

      
    stopEditing() {
        this.activeBox = null;
        this.activeField = null; // Not used in this controller, 
        this.keyboardController.hideKeyboard();
        this.keyboardInput.disable();
        this.textModel = null;
        this.pipeline.invalidate();
        
    }

      insertText(text) {
        if (!this.textModel) {
          console.warn("No active editing state, ignoring insert:", text);
          return;
        }
        this.textModel.insert(text);
        this.activeBox.updateText(this.textModel.getText());
        this.pipeline.invalidate();
      
      }

      backspace() {
        if (!this.textModel) {
          console.warn("No active editing state, ignoring backspace");
          return;
        }
        this.textModel.backSpace();
        this.activeBox.updateText(this.textModel.getText());
        this.pipeline.invalidate();
      
      }
      moveCaretLinearly(offset, shiftKey) {
        this.caretController.moveCaretLinearly(offset, shiftKey);
      }
   
    initCaretBlink() {
        setInterval(() => {
            this.blinkState = !this.blinkState;
            if (this.activeBox) this.pipeline.invalidate();
        }, 500);
    }
      
    drawCaret(ctx) {
      this.caretController.draw(ctx);
 
      }
      
    drawSelection(ctx) {
      this.caretController.drawSelection(ctx);
     
    }
}