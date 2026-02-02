import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { containerRenderer } from "../../renderers/containerRenderer.js";
import { SceneNode } from "./sceneNode.js";

export class ContainerNode extends SceneNode {
    constructor({ id, layout = "vertical",layoutStrategy,renderStrategy, style = {}, children = [] }) {
      super({
        id,
        layoutStrategy: layoutStrategy ?? (layout ? layoutRegistry[layout]() : undefined),
        renderStrategy: renderStrategy ?? containerRenderer,
      });
  
      this.style = style;
  
      for (const child of children) {
        this.add(child);
      }
    }
  }
  