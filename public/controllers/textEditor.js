import { dispatcher } from "../app.js";
import { PopupKeyboard } from "../components/keyBoard.js";
import { ACTIONS } from "../events/actions.js";
import { CaretController } from "./caretController.js";
import { KeyBoardInputController } from "./keyBoardInputController.js";
import { keyboardController } from "./keyboardController.js";
import { TextModel } from "./textModel.js";

export class TextEditorController {
    constructor(pipeline,  layoutManager, layoutRenderer, uiStage) {
        this.activeBox = null;
        this.activeField = null; // Not used in this controller, but kept for consistency
        this.caretIndex = 0;
        this.blinkState = true;
        this.pipeline = pipeline;
        this.layoutManager = layoutManager;
        this.layoutRenderer = layoutRenderer;
this.uiStage = uiStage;
        this.keyboardController = new keyboardController(pipeline, layoutManager, layoutRenderer,uiStage);
        this.textModel = new TextModel(this);
        this.keyboardInput = new KeyBoardInputController(this);
        this.caretController = new CaretController(this);
        // this.selectionStart = this.caretIndex;
        // this.selectionEnd = this.caretIndex;

        // this.boxes = [];
      dispatcher.on(ACTIONS.KEYBOARD.PRESS, (key) => {
        if (this.activeBox) {
          if (key === 'Backspace') {
            this.backspace();
          } else {
            this.insertText(key);
          }
        }
      });
        this.initCaretBlink();
       // this.initKeyboardListeners();
    }

    // setBoxes(boxes) {
    //     this.boxes = boxes;
    //   }
    
    //   getAllBoxes() {
    //     return this.boxes;
    //   }
    

    // handle(box){
    //     this.startEditing(box);
    // }
    // showKeyboard(box, field) {
    //     if (this.keyboard) {
    //       this.uiStage.getActiveRoot().removeChild(this.keyboard);
    //       this.keyboard = null;
    //     }
    
    //     this.keyboard = new PopupKeyboard({
    //       layoutManager: this.layoutManager,
    //       layoutRenderer: this.layoutRenderer,
    //       editorController: this,
    //       targetBox: box,
    //       targetField: field
    //     });
    
    //     this.uiStage.overlayRoot = this.keyboard;
    //     this.positionKeyboard();
    //     this.pipeline.invalidate();
    //   }
    
    //   hideKeyboard() {
    //     if (this.keyboard) {
    //         this.uiStage.overlayRoot = null;
    //       this.keyboard = null;
    //       this.pipeline.invalidate();
    //     }
    //   }
    //   positionKeyboard() {
    //     if (!this.keyboard || !this.activeBox) return;
      
    //     const bounds = this.layoutManager.getLogicalBounds(this.activeBox.id);
    //     if (!bounds) return;
      
    //     const spacing = 10;
    //     const keyboardHeight = this.keyboard.totalKeyboardHeight;
    //     const logicalHeight = this.layoutManager.logicalHeight;
      
    //     // Prefer placing below the input, fallback to above if not enough space
    //     const fitsBelow = bounds.y + bounds.height + spacing + keyboardHeight <= logicalHeight;
    //     const y = fitsBelow
    //       ? bounds.y + bounds.height + spacing
    //       : Math.max(bounds.y - keyboardHeight - spacing, 0);
      
    //     this.layoutManager.place({
    //       id: this.keyboard.id,
    //       x: 0,
    //       y,
    //       width: this.layoutManager.logicalWidth,
    //       height: keyboardHeight
    //     });
    //   }
    
    startEditing(box, field = 'text') {
        const value = this.textModel.getText()
      
        this.activeBox = box;
        this.activeField = field;
        // this.caretIndex = value.length;
        // this.selectionStart = this.selectionEnd = this.caretIndex;
      this.caretController.setCaretToEnd(value);
      this.keyboardInput.enable();
       this.keyboardController.showKeyboard(box, field);

        this.pipeline.invalidate();
      }

      
    stopEditing() {
        this.activeBox = null;
        this.activeField = null; // Not used in this controller, 
        this.keyboardController.hideKeyboard();
        this.keyboardInput.disable();
        this.pipeline.invalidate();
        
    }

      insertText(text) {
       this.textModel.insert(text);
        // if (!this.activeBox || !this.activeField) return;
      
        // const field = this.activeField;
        // const currentText = this.activeBox[field];
        // const before = currentText.slice(0, this.selectionStart);
        // const after = currentText.slice(this.selectionEnd);
        // const newText = before + text + after;
      
        // this.activeBox[field] = newText;
        // this.caretIndex = this.selectionStart + text.length;
        // this.selectionStart = this.selectionEnd = this.caretIndex;
      
        // if (typeof this.activeBox.updateText === 'function' && field === 'text') {
        //   this.activeBox.updateText(newText);
        // }
      
        // this.pipeline.invalidate();
      }

      backspace() {
        this.textModel.backSpace();
      }
      moveCaretLinearly(offset, shiftKey) {
        this.caretController.moveCaretLinearly(offset, shiftKey);
      }
      
    //   deleteSelection() {
    //     if (!this.activeBox || !this.activeField || this.selectionStart === this.selectionEnd) return;
      
    //     const field = this.activeField;
    //     const currentText = this.activeBox[field];
    //     const before = currentText.slice(0, this.selectionStart);
    //     const after = currentText.slice(this.selectionEnd);
    //     const newText = before + after;
      
    //     this.activeBox[field] = newText;
    //     this.caretIndex = this.selectionStart;
    //     this.selectionEnd = this.selectionStart;
      
    //     if (typeof this.activeBox.updateText === 'function' && field === 'text') {
    //       this.activeBox.updateText(newText);
    //     }
      
    //     this.pipeline.invalidate();
    //   }


    // insertChar(char) {
    
    //     if (!this.activeBox||!this.activeField) return;

    //     const field = this.activeField; // Use the active field for text insertion
    //     const text = typeof this.activeBox[field] === 'string' ? this.activeBox[field] : '';

    //     const newText = text.slice(0, this.caretIndex) + char + text.slice(this.caretIndex);

    //     this.activeBox[field] = newText;
           
    //     this.caretIndex++;
    //     this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position

    //     if (typeof this.activeBox.updateText === 'function' ) {
    //         this.activeBox.updateText(newText);
    //       }
        
    //     this.pipeline.invalidate();
    // }

    // deleteChar() {
    //     if (!this.activeBox || !this.activeField || this.caretIndex === 0) return;

    //     const field = this.activeField; // Use the active field for text deletion
    //     const text = this.activeBox[field]
    //     const newText = text.slice(0, this.caretIndex - 1) + text.slice(this.caretIndex);
    //     this.activeBox[field] = newText;
            
    //     this.caretIndex--;
    //     this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position
    //     if (typeof this.activeBox.updateText === 'function' && field === 'text') {
    //         this.activeBox.updateText(newText);
    //       }
        
    //     this.pipeline.invalidate();
    // }

    // moveCaretLeft(shiftKey = false) {
    //     if (!this.activeBox || !this.activeField) return;
    //     if (this.caretIndex > 0) {
    //         this.caretIndex--;
    //         if( shiftKey) {
    //             this.selectionEnd = this.caretIndex; // Extend selection to the left
    //         } else {
    //         this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position
    //         }
    //         this.pipeline.invalidate();
    //     }
    // }

    // moveCaretRight(shiftKey = false) {
    //     if (!this.activeBox || !this.activeField) return;
    //     const field = this.activeField; // Use the active field for caret movement
    //     const text = this.activeBox[field];
    //     if (this.caretIndex < text.length) {
    //         this.caretIndex++;
    //         if(shiftKey) {
    //             this.selectionEnd = this.caretIndex; // Extend selection to the right
    //         } else {
    //         this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position
    //         }
    //         this.pipeline.invalidate();
    //     }
    // }

    initCaretBlink() {
        setInterval(() => {
            this.blinkState = !this.blinkState;
            if (this.activeBox) this.pipeline.invalidate();
        }, 500);
    }

    // initKeyboardListeners() {
    //     window.addEventListener('keydown', (e) => {
          
    //         if (!this.activeBox) return;

    //         if (e.key.length === 1) {
    //             e.preventDefault(); // Prevent default character input
    //             this.insertChar(e.key);
    //         } else if (e.key === 'Backspace') {
    //             e.preventDefault(); // Prevent default backspace behavior
    //             this.deleteChar();
    //         } else if (e.key === 'ArrowLeft') {
    //             this.moveCaretLeft(e.shiftKey);
    //         } else if (e.key === 'ArrowRight') {
    //             this.moveCaretRight(e.shiftKey);
    //         } else if (e.key === 'Escape') {
    //             this.stopEditing();
    //         } 
    //     });
    // }

    drawCaret(ctx) {
      this.caretController.draw(ctx);
  //       if (!this.activeBox || !this.activeField || !this.blinkState) return;
      
  //       const field = this.activeField;
  //       const text = typeof this.activeBox[field] === 'string' ? this.activeBox[field] : '';
  //       const textBeforeCaret = text.slice(0, this.caretIndex);
      
  //       const bounds = this.layoutManager.getScaledBounds(this.activeBox.id, ctx.canvas.width, ctx.canvas.height);
  //       if (!bounds) return;
      
  //       const fontSizeRatio = 0.01;
  // const textWidth = this.layoutRenderer.getTextWidth(textBeforeCaret, fontSizeRatio);

  // const x = bounds.x + textWidth;
  // const fontSize = fontSizeRatio * ctx.canvas.height;
  // const y = bounds.y + bounds.height / 2 - fontSize / 2;

      
  //       ctx.strokeStyle = 'black';
  //       ctx.beginPath();
  //       ctx.moveTo(x, y);
  //       ctx.lineTo(x, y + fontSize);
  //       ctx.stroke();
      }
      
    drawSelection(ctx) {
      this.caretController.drawSelection(ctx);
      //   if (!this.activeBox|| !this.activeField || this.selectionStart === this.selectionEnd) return;

      //   const field = this.activeField; // Use the active field for selection drawing
      //   const text = this.activeBox[field]
      //   const before = text.slice(0, this.selectionStart);
      //   const selected = text.slice(this.selectionStart, this.selectionEnd);

      //  let baseX = this.activeBox.startPosition.x
      //   if(field === 'text') baseX += 65 // Adjust for text box padding
      //   else if(field === 'label') baseX += 10; // Adjust for label box padding
      //   const startX = baseX + ctx.measureText(before).width;
      //   const width = ctx.measureText(selected).width;
      //   const y = this.activeBox.startPosition.y + this.activeBox.size.height / 2 - 10; // Adjust for vertical alignment

      //   ctx.fillStyle = 'rgba(200, 200, 255, 0.5)'; // Light blue selection color
      //   ctx.fillRect(startX, y, width, 20); // Draw selection rectangle
    }
}