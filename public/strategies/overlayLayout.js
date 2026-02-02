
  export function overlayLayoutStrategy() {
    return {
      measure(node, available, ctx) {

        // Overlay itself fills the screen
        for (const child of node.children) {
          child.measure(available, ctx);
        }
        
        return {width: available.maxWidth, height: available.maxHeight};
      },
  
      layout(node, bounds, ctx) {
        node.bounds = bounds;
  
        for (const child of node.children) {
          // ⌨️ Keyboard goes to bottom
          if (child.id === 'keyboard-layer') {
            const h = child.measured?.height ?? 216;
  
            child.layout({
              x: bounds.x,
              y: bounds.y + bounds.height - h,
              width: bounds.width,
              height: h
            }, ctx);
  
          
          } else {
            // Respect child bounds if already set
            if (child.bounds) {
              child.layout(child.bounds, ctx);
            } else {
              child.layout(bounds, ctx);
            }
          }
          
        }
      }
    };
  }
  