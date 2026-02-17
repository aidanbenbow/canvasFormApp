import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { inputRenderer } from "../../renderers/nodeRenderers/inputRenderer.js";
import { InputLayoutStrategy } from "../../strategies/nodeLayouts/inputLayout.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class InputNode extends SceneNode {
  constructor({ id, value = "", placeholder = "", label = "", onChange, editable = true, style = {} }) {
      super({
        id,
        layoutStrategy: layoutRegistry["input"]() || new InputLayoutStrategy(),
        renderStrategy: inputRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.value = value;
      this.placeholder = placeholder;
      this.label = label;
      this.onChange = onChange;
      this.editable = editable;
      this.cursorPos = value.length
  
      const baseStyle = {
        font: "20px 'Segoe UI', Tahoma, sans-serif",
        paddingX: 8,
        paddingY: 6,
        wordCountEnabled: true,
        wordCountFont: "14px 'Segoe UI', Tahoma, sans-serif",
        wordCountColor: "#6b7280",
        wordCountSpacing: 6,
        wordCountMax: null,
        borderColor: "#ccc",
        focusBorderColor: "#0078ff",
        textColor: "#1f2937",
        placeholderColor: "#9ca3af",
        width: 800,
        fillWidth: true,
        minHeight: 32
      };

      const responsiveStyle = isSmallScreen()
        ? {
            font: "36px 'Segoe UI', Tahoma, sans-serif",
            paddingX: 20,
            paddingY: 18,
            wordCountFont: "22px 'Segoe UI', Tahoma, sans-serif",
            wordCountSpacing: 10,
            minHeight: 68,
            width: Math.min(820, Math.floor(window.innerWidth * 0.96))
          }
        : {};

      this.style = {
        ...baseStyle,
        ...responsiveStyle,
        ...style
      };
    }
  
    onPointerDown(pointerX, pointerY) {
      if (!this.editable) return;
      console.log(`InputNode "${this.id}" focused`);
   
      this.context.focusManager.focus(this);
      const ctx = this.context.ctx;
      const editor = this.context.textEditorController;
      if (editor?.beginPointerSelection) {
        editor.beginPointerSelection(this, pointerX, pointerY, ctx);
      } else {
        editor?.caretController?.moveCaretToMousePosition(pointerX, pointerY, ctx);
      }
     
    }

    onPointerUp(pointerX, pointerY) {
      if (!this.editable) return;
      const editor = this.context.textEditorController;
      editor?.endPointerSelection?.({ x: pointerX, y: pointerY });
    }

    onEvent(event) {
      if (!this.editable) return false;
      if (event.type === "mousemove") {
        const editor = this.context.textEditorController;
        if (editor?.selectionDragActive && editor.activeNode === this) {
          editor.updatePointerSelection(event.x, event.y, this.context.ctx);
          return true;
        }
      }
      return false;
    }

    onPointerDoubleClick(pointerX, pointerY) {
      if (!this.editable) return;
      this.context.focusManager.focus(this);
      const ctx = this.context.ctx;
      this.context.textEditorController.caretController.selectWordAtMousePosition(pointerX, pointerY, ctx);
    }

    updateText(newValue) {
      this.value = newValue;
      this.cursorPos = newValue.length;

      this.invalidate();
    }
    getValue() {
      return this.value;
    }
    clear() {
      this.updateText("");
      this.onChange?.("");
    }
  }

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
  