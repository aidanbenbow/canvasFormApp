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
    getValue() {
      return this.value;
    }
    
  }
  