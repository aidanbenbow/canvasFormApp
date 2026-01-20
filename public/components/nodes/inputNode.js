import { inputRenderer } from "../../renderers/nodeRenderers/inputRenderer.js";
import { inputLayoutStrategy } from "../../strategies/nodeLayouts/inputLayout.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class InputNode extends SceneNode {
    constructor({ id, value = "", placeholder = "", onChange, style = {} }) {
      super({
        id,
        layoutStrategy: inputLayoutStrategy,
        renderStrategy: inputRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.value = value;
      this.placeholder = placeholder;
      this.onChange = onChange;
  
      this.state = {
        focused: false,
        cursorPos: value.length
      };
  
      this.style = {
        font: "14px sans-serif",
        paddingX: 8,
        paddingY: 6,
        borderColor: "#ccc",
        focusBorderColor: "#0078ff",
        ...style
      };
    }
  
    onPointerDown() {
      this.state.focused = true;
      this.emit("focus", this);
      this.invalidate();
    }

    updateText(newValue) {
      this.value = newValue;
      this.cursorPos = newValue.length;
      this.invalidate();
    }
  
    onKeyPress(char) {
      if (!this.state.focused) return;
      this.value += char;
      this.cursorPos = this.value.length;
      this.onChange?.(this.value);
      this.invalidate();
    }
  
    onKeyBackspace() {
      if (!this.state.focused) return;
      this.value = this.value.slice(0, -1);
      this.cursorPos = this.value.length;
      this.onChange?.(this.value);
      this.invalidate();
    }
  }
  