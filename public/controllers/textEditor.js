
import { CaretController } from "./caretController.js";
import { KeyBoardInputController } from "./keyBoardInputController.js";
import { keyboardController } from "./keyboardController.js";
import { TextModel } from "./textModel.js";

export class TextEditorController {
    constructor(pipeline,popup) {
        this.activeNode = null;
       
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
        this.activeNode = box;
       
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
        this.activeNode = null;
        
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
       // this.activeNode.updateText(this.textModel.getText());
        this.pipeline.invalidate();
      
      }

      backspace() {
        if (!this.textModel) {
          console.warn("No active editing state, ignoring backspace");
          return;
        }
        this.textModel.backSpace();
        this.activeNode.updateText(this.textModel.getText());
        this.pipeline.invalidate();
      
      }
      moveCaretLinearly(offset, shiftKey) {
        this.caretController.moveCaret(offset, shiftKey);
      }
   
    initCaretBlink() {
        setInterval(() => {
            this.blinkState = !this.blinkState;
            if (this.activeNode) this.pipeline.invalidate();
        }, 500);
    }
      
    drawCaret(ctx) {
      this.caretController.drawCaret(ctx);
      }
      
    drawSelection(ctx) {
      this.caretController.drawSelection(ctx);
    }

    renderOverlay(ctx) {
     
      if (this.activeNode) {
        this.drawSelection(ctx);
        this.drawCaret(ctx);
      }
    }
}