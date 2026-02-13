import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { textRenderer } from "../../renderers/nodeRenderers/textRenderer.js";
import { TextLayoutStrategy } from "../../strategies/nodeLayouts/textLayout.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class TextNode extends SceneNode {
    constructor({ id, text, runs = null, editable = false, onChange, style = {} }) {
      super({
        id,
        layoutStrategy: layoutRegistry["text"]() || new TextLayoutStrategy(),
        renderStrategy: textRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.text = text;
      this.runs = runs;
      this.editable = editable;
      this.onChange = onChange;
  
      const responsiveStyle = isSmallScreen()
        ? {
            font: "46px sans-serif"
          }
        : {};

      this.style = {
        font: "38px sans-serif",
        color: "#CF3113",
        paddingX: 8,
        paddingY: 6,
        ...responsiveStyle,
        ...style
      };
    }

    onPointerDown(pointerX, pointerY) {
      if (!this.editable) return;
      this.context.focusManager?.focus(this);
      const ctx = this.context.ctx;
      const editor = this.context.textEditorController;
      if (editor && editor.activeNode !== this) {
        editor.startEditing(this);
      }
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

    onPointerDoubleClick(pointerX, pointerY) {
      if (!this.editable) return;
      this.context.focusManager?.focus(this);
      const ctx = this.context.ctx;
      this.context.textEditorController?.caretController?.selectWordAtMousePosition(pointerX, pointerY, ctx);
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

    updateText(newValue) {
      this.text = newValue;
      if (this.runs) {
        this.runs = null;
      }
      this.onChange?.(newValue);
      this.invalidate();
    }

    getValue() {
      return this.text ?? "";
    }
  }

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
  