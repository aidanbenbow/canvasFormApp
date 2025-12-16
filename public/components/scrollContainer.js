import { ScrollController } from "../controllers/scrollControllrt.js";
import { UIElement } from "./UiElement.js";

export class UIScrollContainer extends UIElement {
    constructor({ id,context, childSpacing = 10, defaultChildHeight = 50 }) {
      super({ id,context});
      this.scrollController = new ScrollController({ contentHeight: 0, viewportHeight: 0 });
      this.childSpacing = childSpacing || 10;
      this.defaultChildHeight = defaultChildHeight || 50;
      this.interactive = false
    }
  
    addChild(child) {
      super.addChild(child);
    
    }
measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
const innerMaxWidth = Math.max(0, constraints.maxWidth);
let totalHeight = 0;
let maxChildWidth = 0;

for(const child of this.children) {
  const childSize = child.measure({
    maxWidth: innerMaxWidth,
    maxHeight: constraints.maxHeight
  });
  child._measured = childSize;
  maxChildWidth = Math.max(maxChildWidth, childSize.width||innerMaxWidth);
  totalHeight += (childSize.height||this.defaultChildHeight) + this.childSpacing; // child height + spacing

}
if(this.children.length > 0) totalHeight -= this.childSpacing; // remove last spacing
  const width = Math.min(
    constraints.maxWidth,
    maxChildWidth
  );
  const height = Math.min(
    constraints.maxHeight,
    totalHeight
  );
  this._measured = { width, height: height||constraints.maxHeight };
  return this._measured;
  }
layout(x,y,width,height) {
const w = width || this._measured.width;
const h = height || this._measured.height;
this.bounds = { x, y, width: w, height: h };

let currentY = y
for(const child of this.children) {
  const m = child._measured||child.measure({maxWidth: w, maxHeight: h});
  const childHeight = m.height || this.defaultChildHeight;
  const childWidth = Math.min(m.width, w);
  child.layout(x, currentY, childWidth, childHeight);
  currentY += childHeight + this.childSpacing;
}
const contentHeight= this.children.length > 0 ? currentY - y - this.childSpacing : 0;
this.scrollController.setViewportHeight(h);
this.scrollController.setContentHeight(contentHeight);
}

    updateContentHeight() {
      if (!this.children.length) return;
      const containerBounds = this.layoutManager.getLogicalBounds(this.id);
      let maxBottom = containerBounds.y;
      for (const child of this.children) {
        const bounds = this.layoutManager.getLogicalBounds(child.id);
        if (bounds) {
          maxBottom = Math.max(maxBottom, bounds.y + bounds.height);
        }
      }
      this.scrollController.contentHeight = maxBottom - containerBounds.y;
    
    }
  
    handleScroll(deltaY) {
      this.scrollController.scrollBy(deltaY);
    }
  
    render() {
    
      if (!this.visible) return;
  
      const ctx = this.context.ctx
      const canvas = this.context.canvas;
      const scaled = this.getScaledBounds(canvas?.width, canvas?.height);
console.log('render scroll container', this.id, scaled);
      // Set clipping region for scroll container
      ctx.save();
ctx.fillStyle = this.bgColor || '#ffffff';
ctx.fillRect(scaled.x, scaled.y, scaled.width, scaled.height);
ctx.strokeStyle = '#cccccc';
ctx.lineWidth = 1;
ctx.strokeRect(scaled.x, scaled.y, scaled.width, scaled.height);

      ctx.beginPath();
      ctx.rect(scaled.x, scaled.y, scaled.width, scaled.height);
      ctx.clip();

      const pixelPerLogicalY = scaled.height / this.bounds.height;

      ctx.save();
      ctx.translate(scaled.x, scaled.y)
      this.scrollController.apply(ctx, { scaleY: pixelPerLogicalY });
      this.renderChildren();
      ctx.restore();
      ctx.restore();
    }
    
    
  }