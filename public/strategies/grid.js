import { LayoutStrategy } from "./layoutStrategy.js";

export class GridLayoutStrategy extends LayoutStrategy {
    constructor({ columns = 2, spacing = 8, padding = 8 } = {}) {
      super({ spacing, padding });
      this.columns = columns;
    }
  
    apply(container) {
      const childWidth = (container._measured.width - this.padding * 2 - (this.columns - 1) * this.spacing) / this.columns;
      let x = this.padding, y = this.padding, col = 0, rowHeight = 0;
  
      for (const child of container.children) {
        const childSize = child._measured || child.measure({ maxWidth: childWidth });
        child.layout(x, y, childSize.width, childSize.height);
  
        rowHeight = Math.max(rowHeight, childSize.height);
        col++;
        if (col >= this.columns) {
          col = 0;
          x = this.padding;
          y += rowHeight + this.spacing;
          rowHeight = 0;
        } else {
          x += childSize.width + this.spacing;
        }
      }
  
      container.bounds.height = y + rowHeight + this.padding;
    }
  }