export class CenterLayoutStrategy {
    constructor({ padding = 0 } = {}) {
      this.padding = padding; // optional padding around children
    }
  
    // Measure phase
    measure(container, constraints = { maxWidth: Infinity, maxHeight: Infinity }, ctx) {
      // Measure all children first
      for (const child of container.children) {
        child.measure(
          { maxWidth: constraints.maxWidth - 2 * this.padding, 
            maxHeight: constraints.maxHeight - 2 * this.padding }, 
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
  
      const innerWidth = bounds.width - 2 * this.padding;
      const innerHeight = bounds.height - 2 * this.padding;
  
      for (const child of container.children) {
        const { width, height } = child.measured;
  
        child.layout({
          x: bounds.x + this.padding + (innerWidth - width) / 2,
          y: bounds.y + this.padding + (innerHeight - height) / 2,
          width,
          height
        }, ctx);
      }
    }
  }
  