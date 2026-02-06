import { ScrollController } from "../../controllers/scrollControllrt.js";
import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { containerRenderer } from "../../renderers/containerRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class ContainerNode extends SceneNode {
    constructor({ id,context, layout = "vertical",layoutStrategy,renderStrategy, style = {}, children = [], scrollable = false, viewportHeight = 0 }) {
      super({
        id,
        context,
        layoutStrategy: layoutStrategy ?? (layout ? layoutRegistry[layout]() : undefined),
        renderStrategy: renderStrategy ?? containerRenderer,
        hitTestStrategy: rectHitTestStrategy
      });
  
      this.style = style;

       // Add scroll controller if container is scrollable
    if (scrollable) {
      this.scroll = new ScrollController({
        contentHeight: 0,            // will be updated after layout
        viewportHeight: viewportHeight || 0
      });
    }

    this.onEvent = (event) => {
    if(event.type === "wheel" && this.scroll) {
      
      this.scroll.scrollBy(event.originalEvent.deltaY);
      
      this.invalidate();
   
    }
    }
      for (const child of children) {
        this.add(child);
      }
    }
    updateScroll() {
      if (!this.scroll) return;
    
      // Compute total children height
      const contentHeight = this.children.reduce((sum, child) => {
        const childHeight = child.measured?.height || 0;
        const spacing = this.layoutStrategy?.spacing || 0;
        return sum + childHeight + spacing;
      }, 0);
    
      const padding = this.layoutStrategy?.padding || 0;
      const totalContentHeight = contentHeight + padding * 2 - (this.children.length > 0 ? (this.layoutStrategy.spacing || 0) : 0);
    
      // Set scroll content and viewport
      this.scroll.setContentHeight(totalContentHeight);
      this.scroll.setViewportHeight(this.bounds.height || 300);
    
      
    }
    


  }
  