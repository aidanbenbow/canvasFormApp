export class AnchoredOverlayLayoutStrategy {
    constructor({ anchor, optionHeight = 24, maxHeight = 200 } = {}) {
      this.anchor = anchor;           // the input node to anchor to
      this.optionHeight = optionHeight;
      this.maxHeight = maxHeight;
    }
  
    measure(node, constraints, ctx) {
      let width = constraints.maxWidth;
      let height = Math.min(node.options?.length * this.optionHeight || 0, this.maxHeight);
  
      node._measured = { width, height };
      return { width, height };
    }
  
    layout(node, bounds, ctx) {
        this.anchor = node.anchor;
      if (!this.anchor) {
        node.bounds = bounds;
      } else {
        const anchorBounds = this.anchor.bounds;
        const width = anchorBounds.width;
        const height = Math.min(node.options?.length * this.optionHeight || 0, this.maxHeight);
  
        node.bounds = {
          x: anchorBounds.x,
          y: anchorBounds.y + anchorBounds.height,
          width,
          height
        };
      }
  
      // Layout children to fill node
      for (const child of node.children) {
        child.layout({
          x: node.bounds.x,
          y: node.bounds.y,
          width: node.bounds.width,
          height: node.bounds.height
        }, ctx);
      }
    }
  }
  