import { popupRenderStrategy } from "../../renderers/nodeRenderers/popupRenderer.js";
import { ContainerNode } from "./containerNode.js";

export class PopUpNode extends ContainerNode {
    constructor({
      id = "popup",
      layout = "popup",            // popup-specific layout strategy
      backgroundColor=null,
      spacing = 10
    }) {
      super({
        id,
        layout,
        style: { backgroundColor },
        renderStrategy: popupRenderStrategy,
        children: []
      });
  
      this.visible = false;
      this.spacing = spacing;
    }
  
    show() {
      this.visible = true;
      this.hitTestable = false; // Pop-up itself doesn't receive events, but its children can
      this.invalidate();
    }
  
    hide() {
      this.visible = false;
      this.invalidate();
    }
  
    toggle() {
      this.visible = !this.visible;
      this.invalidate();
    }
    clear() {
      this.children = [];
      this.invalidate();
    }
  }