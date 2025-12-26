export const rectHitTestStrategy = {
    hitTest(node, x, y) {
      const { x: nx, y: ny, width, height } = node.bounds;
      return (
        x >= nx &&
        y >= ny &&
        x <= nx + width &&
        y <= ny + height
      );
    }
  };
  