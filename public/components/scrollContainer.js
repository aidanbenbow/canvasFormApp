import { ScrollController } from "../controllers/scrollControllrt.js";
import { UIElement } from "./UiElement.js";

export class UIScrollContainer extends UIElement {
    constructor({ id,context, layoutManager, layoutRenderer, childSpaceing = 10, defaultChildHeight = 50 }) {
      super({ id,context, layoutManager, layoutRenderer });
      this.scrollController = null
      this.childSpacing = childSpaceing || 10;
      this.defaultChildHeight = defaultChildHeight || 50;
    }
  
    addChild(child) {
      super.addChild(child);
      this.layoutChildrenVertically(this.childSpacing, this.defaultChildHeight);
    }
layoutChildrenVertically(spacing, defaultHeight) {
      const containerBounds = this.layoutManager.getLogicalBounds(this.id);
      if (!containerBounds) return;
      let currentY = containerBounds.y + spacing;
      for (const child of this.children) {
        
        this.layoutManager.setLogicalBounds(child.id, {
          x: containerBounds.x + spacing,
          y: currentY,
          width: containerBounds.width - 2 * spacing,
          height: defaultHeight
        });
        currentY += defaultHeight + spacing;
      }
      this.updateContentHeight();
    }
    initializeScroll() {
        const bounds = this.layoutManager.getLogicalBounds(this.id);
        if (!bounds) {
          console.warn(`UIScrollContainer: Bounds not found for ${this.id}`);
          return;
        }
      
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
    
    
  }