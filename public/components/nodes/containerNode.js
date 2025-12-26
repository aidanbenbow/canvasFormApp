import { containerRenderer } from "../../renderers/containerRenderer.js";
import { SceneNode } from "./sceneNode.js";

export class ContainerNode extends SceneNode {
    constructor({ id, layout = "vertical", style = {}, children = [] }) {
      super({
        id,
        layoutStrategy: layoutRegistry[layout](),
        renderStrategy: containerRenderer
      });
  
      this.style = style;
  
      for (const child of children) {
        this.add(child);
      }
    }
  }
  