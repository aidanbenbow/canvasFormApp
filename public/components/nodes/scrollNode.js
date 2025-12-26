import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class ScrollNode extends SceneNode {
    constructor({ id, layout = "vertical", style = {}, children = [] }) {
      super({
        id,
        layoutStrategy: scrollLayoutStrategy(layout),
        renderStrategy: scrollRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.scrollY = 0;
      this.style = style;
  
      for (const child of children) {
        this.add(child);
      }
    }
  
    onWheel(deltaY) {
      this.scrollY = Math.max(0, this.scrollY + deltaY);
      this.invalidate();
    }
  }
  