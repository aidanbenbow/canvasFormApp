
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
      this.selectionDragActive = false;
      this.suppressSelectionMenu = false;
        this.useVirtualKeyboard = isSmallScreen();
  
        this.textModel = null
        this.keyboardInput = new KeyBoardInputController(this);
        this.caretController = new CaretController(this);
       
        this.initCaretBlink();
        this.initClipboard();
        this.initSelectionMenu();
      this.initPointerSelectionListeners();
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
      if (this.useVirtualKeyboard) {
       this.dispatcher.dispatch(ACTIONS.KEYBOARD.SHOW, { initialValue });
      }
      if (!this.useVirtualKeyboard) {
        this.clipboardProxy.focus();
      }
        this.pipeline.invalidate();
      }

      
    stopEditing() {
        this.activeNode = null;
        
        this.dispatcher.dispatch(ACTIONS.KEYBOARD.HIDE);
        this.keyboardInput.disable();
        this.textModel = null;
        this.clipboardProxy.blur();
      this.selectionDragActive = false;
      this.suppressSelectionMenu = false;
        this.useVirtualKeyboard = isSmallScreen();
      this.hideSelectionMenu();
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

    onSelectionChanged(pointer) {
      if (!this.activeNode || !this.caretController) return;
      const { selectionStart, selectionEnd } = this.caretController;
      if (selectionStart === selectionEnd) return;

      if (pointer && typeof pointer.x === "number" && typeof pointer.y === "number") {
        this.showSelectionMenuAtScene(pointer.x, pointer.y);
        return;
      }

      const ctx = this.activeNode.context?.ctx;
      if (!ctx) return;

      const caretPos = this.caretController.getCaretScenePosition(ctx);
      this.showSelectionMenuAtScene(caretPos.x, caretPos.y);
    }

    showSelectionMenuAtScene(sceneX, sceneY) {
      if (!this.selectionMenu || !this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      const constraints = this.pipeline?.constraints;
      const scaleX = constraints?.maxWidth ? this.canvas.width / constraints.maxWidth : 1;
      const scaleY = constraints?.maxHeight ? this.canvas.height / constraints.maxHeight : 1;

      const canvasX = sceneX * scaleX;
      const canvasY = sceneY * scaleY;

      const clientX = rect.left + (canvasX / this.canvas.width) * rect.width;
      const clientY = rect.top + (canvasY / this.canvas.height) * rect.height;

      this.selectionMenu.style.left = `${clientX}px`;
      this.selectionMenu.style.top = `${clientY}px`;
      this.selectionMenu.style.display = "flex";
    }

    hideSelectionMenu() {
      if (!this.selectionMenu) return;
      this.selectionMenu.style.display = "none";
    }

    beginPointerSelection(node, x, y, ctx) {
      if (!node) return;
      if (this.activeNode !== node) {
        this.startEditing(node);
      }

      this.selectionDragActive = true;
      this.suppressSelectionMenu = true;
      this.caretController.startSelectionAtMousePosition(x, y, ctx);
    }

    updatePointerSelection(x, y, ctx) {
      if (!this.selectionDragActive) return;
      this.caretController.updateSelectionToMousePosition(x, y, ctx);
    }

    endPointerSelection(pointer) {
      if (!this.selectionDragActive) return;
      this.selectionDragActive = false;
      this.suppressSelectionMenu = false;

      const { selectionStart, selectionEnd } = this.caretController;
      if (selectionStart === selectionEnd) {
        this.hideSelectionMenu();
        return;
      }

      if (pointer) {
        this.onSelectionChanged(pointer);
      } else {
        this.onSelectionChanged();
      }
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

this.clipboardProxy.addEventListener("cut", (e) => {
  if (!this.activeNode || !this.textModel) return;

  const { selectionStart, selectionEnd } = this.caretController;
  if (selectionStart === selectionEnd) return;

  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);

  const text = this.textModel.getText().slice(start, end);
  e.clipboardData.setData("text/plain", text);
  e.preventDefault();

  this.textModel.replaceSelection("");
  this.pipeline.invalidate();
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

    initSelectionMenu() {
      this.selectionMenu = document.createElement("div");
      Object.assign(this.selectionMenu.style, {
        position: "fixed",
        display: "none",
        gap: "6px",
        padding: "6px",
        background: "rgba(255, 255, 255, 0.85)",
        border: "1px solid #d0d0d0",
        borderRadius: "8px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
        zIndex: "9999",
        fontFamily: "Segoe UI, Tahoma, sans-serif"
      });

      const cutBtn = this.createSelectionButton("Cut", () => this.cutSelection());
      const copyBtn = this.createSelectionButton("Copy", () => this.copySelection());
      const pasteBtn = this.createSelectionButton("Paste", () => this.pasteFromClipboard());

      this.selectionMenu.appendChild(cutBtn);
      this.selectionMenu.appendChild(copyBtn);
      this.selectionMenu.appendChild(pasteBtn);

      document.body.appendChild(this.selectionMenu);

      this._selectionMenuDocHandler = (event) => {
        if (this.selectionMenu.style.display === "none") return;
        if (!this.selectionMenu.contains(event.target)) {
          this.hideSelectionMenu();
        }
      };
      document.addEventListener("mousedown", this._selectionMenuDocHandler);
    }

    initPointerSelectionListeners() {
      this._selectionPointerEndHandler = () => {
        if (!this.selectionDragActive) return;
        this.endPointerSelection();
      };

      document.addEventListener("mouseup", this._selectionPointerEndHandler);
      document.addEventListener("touchend", this._selectionPointerEndHandler);
      document.addEventListener("touchcancel", this._selectionPointerEndHandler);
    }

    createSelectionButton(label, onClick) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      Object.assign(btn.style, {
        border: "1px solid #c7c7c7",
        background: "#f7f7f7",
        borderRadius: "6px",
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: "12px"
      });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        onClick();
        this.hideSelectionMenu();
      });
      return btn;
    }

    getSelectionRange() {
      if (!this.caretController) return null;
      const { selectionStart, selectionEnd } = this.caretController;
      if (selectionStart === selectionEnd) return null;
      return {
        start: Math.min(selectionStart, selectionEnd),
        end: Math.max(selectionStart, selectionEnd)
      };
    }

    getSelectedText() {
      const range = this.getSelectionRange();
      if (!range || !this.textModel) return "";
      return this.textModel.getText().slice(range.start, range.end);
    }

    async copySelection() {
      const text = this.getSelectedText();
      if (!text) return;

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return;
        } catch (err) {
          console.warn("Clipboard writeText failed, falling back:", err);
        }
      }

      if (!this.clipboardProxy || this.useVirtualKeyboard) return;
      this.clipboardProxy.value = text;
      this.clipboardProxy.focus();
      this.clipboardProxy.select();
      document.execCommand("copy");
      this.clipboardProxy.value = "";
      this.clipboardProxy.blur();
    }

    async cutSelection() {
      const text = this.getSelectedText();
      if (!text || !this.textModel) return;

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          console.warn("Clipboard writeText failed, falling back:", err);
        }
      } else if (this.clipboardProxy && !this.useVirtualKeyboard) {
        this.clipboardProxy.value = text;
        this.clipboardProxy.focus();
        this.clipboardProxy.select();
        document.execCommand("copy");
        this.clipboardProxy.value = "";
        this.clipboardProxy.blur();
      }

      this.textModel.replaceSelection("");
      this.pipeline.invalidate();
    }

    async pasteFromClipboard() {
      if (!this.textModel) return;

      if (navigator.clipboard?.readText) {
        try {
          const text = await navigator.clipboard.readText();
          if (!text) return;
          this.textModel.replaceSelection(text);
          this.pipeline.invalidate();
        } catch (err) {
          console.warn("Clipboard readText failed:", err);
        }
      }
    }
    
    
}

function isSmallScreen() {
  // tweak the breakpoint as needed
  return window.innerWidth < 1024;
}
