export class HorizontalLayoutStrategy {
  constructor({ padding = 12, spacing = 10, rowSpacing = 10 } = {}) {
    this.padding = padding;
    this.spacing = spacing;
    this.rowSpacing = rowSpacing;
  }

  measure(container, constraints = { maxWidth: Infinity, maxHeight: Infinity }, ctx) {
    const contentWidth = Math.max(0, constraints.maxWidth - this.padding * 2);
    let x = 0;
    let rowHeight = 0;
    let totalHeight = this.padding;
    let maxUsedWidth = 0;

    for (const child of container.children) {
      const childSize = child.measure(
        { maxWidth: contentWidth, maxHeight: constraints.maxHeight },
        ctx
      );

      const nextX = x === 0 ? childSize.width : x + this.spacing + childSize.width;
      const shouldWrap = x > 0 && nextX > contentWidth;

      if (shouldWrap) {
        totalHeight += rowHeight + this.rowSpacing;
        maxUsedWidth = Math.max(maxUsedWidth, x);
        x = childSize.width;
        rowHeight = childSize.height;
      } else {
        x = nextX;
        rowHeight = Math.max(rowHeight, childSize.height);
      }
    }

    if (rowHeight > 0) {
      totalHeight += rowHeight;
      maxUsedWidth = Math.max(maxUsedWidth, x);
    }

    totalHeight += this.padding;

    return {
      width: Math.min(maxUsedWidth + this.padding * 2, constraints.maxWidth),
      height: Math.min(totalHeight, constraints.maxHeight)
    };
  }

  layout(container, bounds, ctx) {
    container.bounds = bounds;
    const contentWidth = Math.max(0, bounds.width - this.padding * 2);

    let x = bounds.x + this.padding;
    let y = bounds.y + this.padding;
    let rowHeight = 0;

    for (const child of container.children) {
      const childWidth = Math.min(child.measured?.width ?? contentWidth, contentWidth);
      const childHeight = child.measured?.height ?? 0;

      const usedX = x - (bounds.x + this.padding);
      const shouldWrap = usedX > 0 && (usedX + this.spacing + childWidth > contentWidth);

      if (shouldWrap) {
        x = bounds.x + this.padding;
        y += rowHeight + this.rowSpacing;
        rowHeight = 0;
      }

      child.layout({
        x,
        y,
        width: childWidth,
        height: childHeight
      }, ctx);

      x += childWidth + this.spacing;
      rowHeight = Math.max(rowHeight, childHeight);
    }
  }
}
