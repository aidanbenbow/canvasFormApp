export class VerticalLayoutStrategy {
  constructor({ padding = 18, spacing = 16 } = {}) {
    this.padding = padding;
    this.spacing = spacing;
  }

  measure(container, constraints = { maxWidth: Infinity, maxHeight: Infinity }, ctx) {
    let height = this.padding;
    let maxChildWidth = 0;

    for (const child of container.children) {

      const childSize = child.measure(  
        { maxWidth: constraints.maxWidth - 2 * this.padding, maxHeight: constraints.maxHeight },ctx
      );
      height+= childSize.height + this.spacing;
      maxChildWidth = Math.max(maxChildWidth, childSize.width);
    }

    height +=this.padding - this.spacing; // remove last spacing, add bottom padding

    return {
      width: Math.min(maxChildWidth + 2 * this.padding, constraints.maxWidth),
      height: Math.min(height, constraints.maxHeight)
    };
  }

  layout(container, bounds, ctx) {
    container.bounds = bounds;
  
    let y = bounds.y + this.padding 
  
    const availableWidth = bounds.width - this.padding * 2;

    for (const child of container.children) {
      const { height } = child.measured;
      const childMeasuredWidth = child.measured?.width ?? availableWidth;
      const shouldFillWidth = child.style?.fillWidth !== false;
      const childWidth = shouldFillWidth ? availableWidth : Math.min(childMeasuredWidth, availableWidth);
  
      child.layout({
        x: bounds.x + this.padding,
        y,
        width: childWidth,
        height
      }, ctx);
  
      y += height + this.spacing;
    }
  }
  
}