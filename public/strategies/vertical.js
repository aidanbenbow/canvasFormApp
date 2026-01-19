export class VerticalLayoutStrategy {
  constructor({ padding = 18, spacing = 6 } = {}) {
    this.padding = padding;
    this.spacing = spacing;
  }

  measure(container, constraints = { maxWidth: Infinity, maxHeight: Infinity }, ctx) {
    let totalWidth = 0;
    let totalHeight = this.padding;

    for (const child of container.children) {

      const childSize = child.measure(  ctx,
        { maxWidth: constraints.maxWidth - 2 * this.padding, maxHeight: constraints.maxHeight }
      );
      totalWidth = Math.max(totalWidth, childSize.width);
      totalHeight += childSize.height + this.spacing;
    }

    totalWidth += 2 * this.padding;
    totalHeight += this.padding - this.spacing;

    return {
      width: Math.min(totalWidth, constraints.maxWidth),
      height: Math.min(totalHeight, constraints.maxHeight)
    };
  }

  layout(container, bounds, ctx) {
    
    let currentY = bounds.y + this.padding;
    const innerWidth = bounds.width - 2 * this.padding;

    for (const child of container.children) {
      const w = child.measured.width || innerWidth;
      const h = child.measured.height || 30;
      child.layout({ x: bounds.x + this.padding, y: currentY, width: w, height: h }, ctx);
      currentY += h + this.spacing;
    }

    container.bounds.height = currentY - bounds.y + this.padding - this.spacing;
    container.bounds.width = bounds.width;
  }
}