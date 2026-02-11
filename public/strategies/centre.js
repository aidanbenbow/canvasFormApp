export class CenterLayoutStrategy {
    constructor({ padding = 40, verticalAlign = 'top' } = {}) {
      this.padding = padding; // optional padding around children
      this.verticalAlign = verticalAlign; // 'top', 'center', 'bottom'
      console.log("CenterLayoutStrategy created with padding:", this.padding);
    }
  
    // Measure phase
    measure(container, constraints = { maxWidth: Infinity, maxHeight: Infinity }, ctx) {
      // Measure all children first
      const padding = this._getPadding(constraints.maxWidth, constraints.maxHeight);

      for (const child of container.children) {
        child.measure(
          { maxWidth: constraints.maxWidth - 2 * padding, 
            maxHeight: constraints.maxHeight - 2 * padding }, 
          ctx
        );
      }
  
      // Center layout fills all available space
      return {
        width: constraints.maxWidth,
        height: constraints.maxHeight
      };
    }
  
    // Layout phase
    layout(container, bounds, ctx) {
      container.bounds = bounds;
  
      const padding = this._getPadding(bounds.width, bounds.height);
      const innerWidth = bounds.width - 2 * padding;
      const innerHeight = bounds.height - 2 * padding;
  
      for (const child of container.children) {
        const measured = child.measured;
        const width = innerWidth;
        const height = innerHeight;
        let y;
        const canCenter = height <= innerHeight;
        const useAutoCenter = isSmallScreen() && this.verticalAlign === "top" && canCenter;

        if (this.verticalAlign === "center" || useAutoCenter) {
          y = bounds.y + padding + (innerHeight - height) / 2;
        } else {
          y = bounds.y + padding; // top-aligned
        }
        child.layout({
          x: bounds.x + padding,
          y,
          width,
          height
        }, ctx);
      }
    }

    _getPadding(maxWidth, maxHeight) {
      if (isSmallScreen()) {
        const relative = Math.floor(Math.min(maxWidth, maxHeight) * 0.04);
        return Math.max(16, Math.min(this.padding, relative));
      }
      return this.padding;
    }
  }

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
  