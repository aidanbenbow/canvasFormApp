export function engineRootLayoutStrategy() {
    return {
      measure(node, available, ctx) {
        // Root fills the screen
        for (const child of node.children) {
          child.measure(available, ctx);
        }
        return available;
      },
  
      layout(node, bounds, ctx) {
        // 🔴 THIS WAS MISSING
        node.bounds = bounds;
  
        for (const child of node.children) {
          const measured = child.measured ?? child.measure(bounds, ctx);
  
          child.layout(
            {
              x: bounds.x,
              y: bounds.y,
              width: measured.maxWidth,
              height: measured.maxHeight
            },
            ctx
          );
          
        }
      }
    };
  }
  