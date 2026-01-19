export class RootLayoutStrategy {
    measure(container, constraints) {
      return {
        width: constraints.maxWidth,
        height: constraints.maxHeight
      };
    }
  
    layout(container, bounds, ctx) {
      for (const child of container.children) {
        child.layout(
          {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
          },
          ctx
        );
      }
  
      container.bounds = bounds;
    }
  }