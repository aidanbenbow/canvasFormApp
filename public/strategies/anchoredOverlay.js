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
        const anchor = node.anchor;
        const optionHeight = this.optionHeight;
        const menuHeight = Math.min((node.options?.length || 0) * optionHeight, this.maxHeight);
      
        if (!anchor) {
          node.bounds = { ...bounds, height: menuHeight };
        } else {
          const ab = anchor.bounds;
          node.bounds = {
            x: ab.x,
            y: ab.y + ab.height,
            width: ab.width,
            height: menuHeight
          };
        }
      
        // layout children as vertical stack
        node.children.forEach((child, i) => {
          child.layout({
            x: node.bounds.x,
            y: node.bounds.y + i * optionHeight,
            width: node.bounds.width,
            height: optionHeight
          }, ctx);
        });
      }
      
  }
  