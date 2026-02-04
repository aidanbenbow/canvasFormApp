import { buttonRenderer } from "../../renderers/buttonRenderer.js";
import { ButtonLayoutStrategy } from "../../strategies/buttonLayoutStrategy.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class ButtonNode extends SceneNode {
    constructor({ id, label, onClick, style = {} }) {
      super({
        id,
        layoutStrategy: ButtonLayoutStrategy,
        renderStrategy: buttonRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.label = label;
      this.onClick = onClick;
  
      this.state = {
        hovered: false,
        pressed: false,
        disabled: false
      };
  
      this.style = {
        font: '16px sans-serif',
        paddingX: 16,
        paddingY: 6,
        radius: 4,
        ...style
      };
    }
  
    onPointerEnter() {
      if (this.state.disabled) return;
      this.state.hovered = true;
      this.invalidate();
    }
  
    onPointerLeave() {
      this.state.hovered = false;
      this.state.pressed = false;
      this.invalidate();
    }
  
    onPointerDown() {
   
      if (this.state.disabled) return;
      this.state.pressed = true;
      this.invalidate();
    }
  
    onPointerUp() {
      if (this.state.disabled) return;
  
      if (this.state.pressed) {
        console.log("Button clicked:", this.id);
        this.onClick?.();
      }
  
      this.state.pressed = false;
      this.invalidate();
    }
  }
  
  