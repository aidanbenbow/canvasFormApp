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
        font: "20px sans-serif",
        paddingX: 8,
        paddingY: 6,
        borderColor: "#ccc",
        focusBorderColor: "#0078ff",
        width: 800,
        minHeight: 32
      };

      const responsiveStyle = isSmallScreen()
        ? {
            font: "24px sans-serif",
            paddingX: 12,
            paddingY: 10,
            minHeight: 44,
            width: Math.min(560, Math.floor(window.innerWidth * 0.9))
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
      const ctx = this.context.ctx
      this.context.textEditorController.caretController.moveCaretToMousePosition(pointerX, pointerY, ctx);
     
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
  