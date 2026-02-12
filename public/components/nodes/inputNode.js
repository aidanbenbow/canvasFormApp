import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { inputRenderer } from "../../renderers/nodeRenderers/inputRenderer.js";
import { InputLayoutStrategy } from "../../strategies/nodeLayouts/inputLayout.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class InputNode extends SceneNode {
    constructor({ id, value = "", placeholder = "", onChange, style = {} }) {
      super({
        id,
        layoutStrategy: layoutRegistry["input"]() || new InputLayoutStrategy(),
        renderStrategy: inputRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.value = value;
      this.placeholder = placeholder;
      this.onChange = onChange;
      this.cursorPos = value.length
  
      const baseStyle = {
        font: "20px 'Segoe UI', Tahoma, sans-serif",
        paddingX: 8,
        paddingY: 6,
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
            font: "28px 'Segoe UI', Tahoma, sans-serif",
            paddingX: 16,
            paddingY: 14,
            minHeight: 56,
            width: Math.min(720, Math.floor(window.innerWidth * 0.94))
          }
        : {};

      this.style = {
        ...baseStyle,
        ...responsiveStyle,
        ...style
      };
    }
  
    onPointerDown(pointerX, pointerY) {
      console.log(`InputNode "${this.id}" focused`);
      console.log(this.context)
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
      const editor = this.context.textEditorController;
      editor?.endPointerSelection?.({ x: pointerX, y: pointerY });
    }

    onEvent(event) {
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
  