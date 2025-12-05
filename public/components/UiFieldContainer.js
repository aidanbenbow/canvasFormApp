import { UIElement } from "./UiElement.js";

export class UIFieldContainer extends UIElement {
  constructor({
    id,
    context,
    layoutManager,
    layoutRenderer,
    bgColor = "#f9f9f9",
    padding = 8,
    spacing = 8
  }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.bgColor = bgColor;
    this.padding = padding;
    this.spacing = spacing;
  }

  addChild(child) {
    super.addChild(child);
    //this.layoutChildrenVertically(this.padding, 30);
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
  }
measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
 const innerMaxWidth = Math.max(0, constraints.maxWidth - 2 * this.padding);
  let totalHeight = this.padding; // top padding
  let maxChildWidth = 0;

  for (const child of this.children) {
    const childSize = child.measure({
      maxWidth: innerMaxWidth,
      maxHeight: constraints.maxHeight
    });
    child._measured = childSize;
    maxChildWidth = Math.max(maxChildWidth, childSize.width);
    totalHeight += childSize.height + this.spacing; // child height + spacing
  }
  const width = Math.min(
    constraints.maxWidth,
    maxChildWidth + 2 * this.padding
  );
  const height = Math.min(
    constraints.maxHeight,
    totalHeight
  );
  this._measured = { width, height };
  return this._measured;
}

  render() {
    if (!this.visible) return;
const canvas = this.layoutRenderer?.canvas;
    const ctx = this.layoutRenderer.ctx;
    const scaled = this.getScaledBounds(canvas?.width, canvas?.height);
    // Draw background
    this.layoutRenderer.drawRect(this.id, {
      x: scaled.x,
      y: scaled.y,
      width: scaled.width,
      height: scaled.height,
      fill: this.bgColor
    });
    this.renderChildren();
  }

  layout(x, y, width, height) {
    console.log("Layout UIFieldContainer:", this.id, x, y, width, height);
    const w = width || this._measured.width;
    const h = height || this._measured.height;
    // Layout children vertically within the container
    let currentY = y + this.padding;
    const childMaxWidth = w - 2 * this.padding;
    for (const child of this.children) {
      const m = child._measured || child.measure({ maxWidth: childMaxWidth, maxHeight: height });
      const childWidth = Math.min(m.width, childMaxWidth);
      const childHeight = m.height
      child.layout(
        x + this.padding,
        currentY,
        childWidth,
        childHeight
      );
      currentY += childHeight + this.spacing;
    }
  }
}