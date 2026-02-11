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
  
      const baseStyle = {
        font: '16px sans-serif',
        paddingX: 16,
        paddingY: 6,
        radius: 4,
        minHeight: 30
      };

      const responsiveStyle = isSmallScreen()
        ? {
            font: '20px sans-serif',
            paddingX: 20,
            paddingY: 10,
            minHeight: 48
          }
        : {};

      this.style = {
        ...baseStyle,
        ...responsiveStyle,
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
  
function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
  
