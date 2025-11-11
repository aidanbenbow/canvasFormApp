import { ScrollController } from "../controllers/scrollControllrt.js";
import { UIElement } from "./UiElement.js";

export class UIScrollContainer extends UIElement {
    constructor({ id, layoutManager, layoutRenderer }) {
      super({ id, layoutManager, layoutRenderer });
      this.scrollController = null
    }
  
    addChild(child) {
      super.addChild(child);
      this.updateContentHeight();
    }

    initializeScroll() {
        const bounds = this.layoutManager.getLogicalBounds(this.id);
        if (!bounds) {
          console.warn(`UIScrollContainer: Bounds not found for ${this.id}`);
          return;
        }
        // console.log('Container bounds:', this.layoutManager.getLogicalBounds(this.id));
      
        this.scrollController = new ScrollController({
          contentHeight: 0,
          viewportHeight: bounds.height
        });
      }
  
    updateContentHeight() {
      if (!this.children.length) return;
      const lastChild = this.children[this.children.length - 1];
      const bounds = this.layoutManager.getLogicalBounds(lastChild.id);
      const containerBounds = this.layoutManager.getLogicalBounds(this.id);
      this.scrollController.contentHeight = bounds.y + bounds.height - containerBounds.y;
      // console.log('Container bounds:', this.layoutManager.getLogicalBounds(this.id));
      // console.log('Last child bounds:', this.layoutManager.getLogicalBounds(lastChild.id));
    }
  
    handleScroll(deltaY) {
      this.scrollController.scrollBy(deltaY);
    }
  
    render() {
      if (!this.visible) return;
  
      const ctx = this.layoutRenderer.ctx;
      const bounds = this.getScaledBounds();

      ctx.save();
        // Draw visible stroke around the scroll container
  ctx.strokeStyle = '#0077cc'; // or any color you prefer
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(10, 119, 204, 0.1)'; // light fill to indicate area
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.beginPath();
      ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
     
     ctx.clip();
  
      ctx.save();
      this.scrollController.apply(ctx); // shift all children by offsetY
      this.children.forEach(child => child.render());
      ctx.restore();
  
      ctx.restore();
    }
    
    // dispatchEvent(event) {
    //   if (!this.visible || !this.scrollController) return false;
    
    //   const offsetY = this.scrollController.offsetY || 0;
    //   const adjustedEvent = { ...event, y: event.y + offsetY };
    
    //   for (const child of this.children) {
    //     if (child.dispatchEvent?.(adjustedEvent)) return true;
        
    //   }
    
    //   return false;
    // }
    
  }