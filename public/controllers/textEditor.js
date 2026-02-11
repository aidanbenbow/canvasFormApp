
import { InputNode } from "../components/nodes/inputNode.js";
import { ACTIONS } from "../events/actions.js";
import { CaretController } from "./caretController.js";
import { KeyBoardInputController } from "./keyBoardInputController.js";
import { keyboardController } from "./keyboardController.js";
import { TextModel } from "./textModel.js";

export class TextEditorController {
    constructor({pipeline, canvas, dispatcher}) {
        this.activeNode = null;
        this.dispatcher = dispatcher;
       this.canvas = canvas;
        this.caretIndex = 0;
        this.blinkState = true;
        this.pipeline = pipeline;
  
        this.textModel = null
        this.keyboardInput = new KeyBoardInputController(this);
        this.caretController = new CaretController(this);
       
        this.initCaretBlink();
        this.initClipboard();
       this.bindUIActions();
        
    }
    bindUIActions() {
      // Use your dispatcher correctly, depending on its API
      // For example, if it's TinyEmitter-like:
      this.unsubFocus = this.dispatcher.on(ACTIONS.UI.FOCUS, ({ Node }) => {
        if (Node instanceof InputNode) this.startEditing(Node);
      });
  
      this.unsubBlur = this.dispatcher.on(ACTIONS.UI.BLUR, ({ Node }) => {
        console.log("Blur event received for Node:", Node);
        if (Node instanceof InputNode) this.stopEditing();
      });
    }
  
    destroy() {
      this.unsubFocus?.();
      this.unsubBlur?.();
    }

    
    startEditing(box, field = 'text') {
        this.activeNode = box;
       
       //Initialize the text model with the box’s current value
  const initialValue = box.getValue?.() || '';
  this.textModel = new TextModel(this);     // re‑create or reset model
  this.textModel.setText(initialValue);     // ensure buffer is populated

      this.caretController.setCaretToEnd(initialValue);
      this.keyboardInput.enable();
      if(isSmallScreen()){
       this.dispatcher.dispatch(ACTIONS.KEYBOARD.SHOW, { initialValue });
      }
this.clipboardProxy.focus();
        this.pipeline.invalidate();
      }

      
    stopEditing() {
        this.activeNode = null;
        
        this.dispatcher.dispatch(ACTIONS.KEYBOARD.HIDE);
        this.keyboardInput.disable();
        this.textModel = null;
        this.clipboardProxy.blur();
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
      moveCaretUp(shiftKey) {
        const node = this.activeNode;
        if (!node) return;
        
        const { lines } = node._layout;
        let caretIndex = this.caretController.caretIndex;
    
        // Find current line
        let lineStart = 0;
        let lineIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineEnd = lineStart + lines[i].text.length;
            if (caretIndex <= lineEnd) {
                lineIndex = i;
                break;
            }
            lineStart = lineEnd;
        }
    
        if (lineIndex === 0) return; // already at top
    
        // Move caret to roughly same X offset on line above
        const currentLineOffset = caretIndex - lineStart;
        const prevLineLength = lines[lineIndex - 1].text.length;
        const newIndex = lineStart - lines[lineIndex - 1].text.length + Math.min(currentLineOffset, prevLineLength);
    
        this.caretController.moveCaretTo(newIndex, shiftKey);
    }
    
    moveCaretDown(shiftKey) {
        const node = this.activeNode;
        if (!node) return;
        
        const { lines } = node._layout;
        let caretIndex = this.caretController.caretIndex;
    
        // Find current line
        let lineStart = 0;
        let lineIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineEnd = lineStart + lines[i].text.length;
            if (caretIndex <= lineEnd) {
                lineIndex = i;
                break;
            }
            lineStart = lineEnd;
        }
    
        if (lineIndex >= lines.length - 1) return; // already at bottom
    
        // Move caret to roughly same X offset on line below
        const currentLineOffset = caretIndex - lineStart;
        const nextLineLength = lines[lineIndex + 1].text.length;
        const newIndex = lineStart + lines[lineIndex].text.length + Math.min(currentLineOffset, nextLineLength);
    
        this.caretController.moveCaretTo(newIndex, shiftKey);
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

    initClipboard() {
      this.clipboardProxy = document.createElement("textarea");

Object.assign(this.clipboardProxy.style, {
  position: "fixed",
  opacity: "0",
  background: "transparent",
  color: "transparent",
  border: "none",
  resize: "none",
  outline: "none",
  fontSize: "16px", // prevents iOS zoom
});
document.body.appendChild(this.clipboardProxy);
this.canvas.addEventListener("contextmenu", (e) => {
  if (!this.activeNode) return;

  e.preventDefault(); // suppress canvas menu

  this.clipboardProxy.style.left = e.clientX + "px";
  this.clipboardProxy.style.top = e.clientY + "px";

  this.clipboardProxy.focus();

  // Let browser show native menu
  setTimeout(() => {
    this.clipboardProxy.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY
      })
    );
  });
});

this.clipboardProxy.addEventListener("copy", (e) => {
  if (!this.activeNode || !this.textModel) return;

  const { selectionStart, selectionEnd } = this.caretController;
  if (selectionStart === selectionEnd) return;

  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);

  const text = this.textModel.getText().slice(start, end);

  e.clipboardData.setData("text/plain", text);
  e.preventDefault();
});

    
      this.clipboardProxy.addEventListener("paste", (e) => {
        if (!this.activeNode || !this.textModel) return;
    
        e.preventDefault();
    
        const text = e.clipboardData.getData("text/plain");
        if (!text) return;
    
        this.textModel.insert(text);
        this.activeNode.updateText(this.textModel.getText());
        this.pipeline.invalidate();
      });
    }
    
    
}

function isSmallScreen() {
  // tweak the breakpoint as needed
  return window.innerWidth < 1024;
}
