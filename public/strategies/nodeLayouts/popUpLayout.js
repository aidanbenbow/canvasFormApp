export const popupLayoutStrategy = {
    measure(node, constraints, ctx) {
      // Popup fills the whole screen
      const width = constraints.maxWidth;
      const height = constraints.maxHeight;
  
      // Measure children so layout() has real sizes
      for (const child of node.children) {
        child.measure( ctx,
          { maxWidth: width, maxHeight: height }
        );
      }
  
      return { width, height };
    },
  
    layout(node, bounds, ctx) {
      node.bounds = bounds;
  
      for (const child of node.children) {
        const size = child.measured;
  
        child.layout({
          x: bounds.x + (bounds.width - size.width) / 2,
          y: bounds.y + (bounds.height - size.height) / 2,
          width: size.width,
          height: size.height
        }, ctx);
      }
    }
  };