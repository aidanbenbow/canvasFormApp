import { ScrollController } from "../../controllers/scrollControllrt.js";
import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { containerRenderer } from "../../renderers/containerRenderer.js";
import { SceneNode } from "./sceneNode.js";

export class ContainerNode extends SceneNode {
    constructor({ id,context, layout = "vertical",layoutStrategy,renderStrategy, style = {}, children = [], scrollable = false, viewportHeight = 0 }) {
      super({
        id,
        context,
        layoutStrategy: layoutStrategy ?? (layout ? layoutRegistry[layout]() : undefined),
        renderStrategy: renderStrategy ?? containerRenderer,
      });
  
      this.style = style;

       // Add scroll controller if container is scrollable
    if (scrollable) {
      this.scroll = new ScrollController({
        contentHeight: 0,            // will be updated after layout
        viewportHeight: viewportHeight || 0
      });
    }
  
      for (const child of children) {
        this.add(child);
      }
    }
    // Update scroll content height after measuring children
  updateScroll() {
    if (!this.scroll) return;
    if (!this.measured) return;

    // contentHeight = total height of children including spacing/padding
    this.scroll.setContentHeight(this.measured.height);

    // viewportHeight = visible height of container
    this.scroll.setViewportHeight(this.bounds.height || this.measured.height);
  }
  }
  