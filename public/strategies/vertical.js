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
  }