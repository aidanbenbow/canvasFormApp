import { LayoutStrategy } from "./layoutStrategy.js";

export class VerticalLayoutStrategy extends LayoutStrategy {
    apply(container) {
      let currentY = this.padding;
      const width = container._measured?.width || 0;
  
      for (const child of container.children) {
        const childSize = child._measured || child.measure({ maxWidth: width - 2 * this.padding });
        child.layout(this.padding, currentY, childSize.width, childSize.height);
        currentY += childSize.height + this.spacing;

         // 🔹 If child is itself a container, apply strategy recursively
      if (child.layoutStrategy || container.layoutStrategy) {
        const strategy = child.layoutStrategy || container.layoutStrategy;
        strategy.apply(child);
      }

      }
  
      // Update container height to fit children
      container.bounds.height = currentY + this.padding - this.spacing;
    }
    measure(container, constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
      let totalWidth = 0;
      let totalHeight = this.padding;
  
      for (const child of container.children) {
        // Ask child to measure itself
        const childSize = child.measure
          ? child.measure({ maxWidth: constraints.maxWidth - 2 * this.padding })
          : { width: 100, height: 30 }; // fallback
  
        totalWidth = Math.max(totalWidth, childSize.width);
        totalHeight += childSize.height + this.spacing;
      }
  
      // Add padding
      totalWidth += 2 * this.padding;
      totalHeight += this.padding - this.spacing;
  
      // Save measured size
      container._measured = {
        width: Math.min(totalWidth, constraints.maxWidth),
        height: Math.min(totalHeight, constraints.maxHeight),
      };
  
      return container._measured;
    }
  }