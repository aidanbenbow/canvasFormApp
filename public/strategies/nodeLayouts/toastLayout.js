export class ToastLayoutStrategy {
    measure(node, constraints, ctx) {
      const width = constraints.maxWidth;
      const height = constraints.maxHeight;
  
      // measure children freely, but within screen constraints
      for (const child of node.children) {
        child.measure({ maxWidth: width, maxHeight: height }, ctx);
      }
  
      return { width, height };
    }
  
    layout(node, bounds, ctx) {
      node.bounds = bounds;
  
      const spacing = node.spacing ?? 10;
      const marginBottom = node.marginBottom ?? 40;
  
      // Start stacking from bottom upwards
      let cursorY = bounds.y + bounds.height - marginBottom;
  
      // Render newest last? depends on your add order.
      // We'll stack from last child upward (newest at bottom).
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        const size = child.measured;
  
        const x = bounds.x + (bounds.width - size.width) / 2;
        const y = cursorY - size.height;
  
        child.layout({ x, y, width: size.width, height: size.height }, ctx);
  
        cursorY = y - spacing;
      }
    }
  }
  