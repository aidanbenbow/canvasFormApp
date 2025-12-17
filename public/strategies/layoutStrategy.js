export class LayoutStrategy {
    constructor({ spacing = 8, padding = 8 } = {}) {
      this.spacing = spacing;
      this.padding = padding;
    }
  
    // Should be implemented by subclasses
    apply(container) {
      throw new Error("LayoutStrategy.apply() must be implemented");
    }
  }