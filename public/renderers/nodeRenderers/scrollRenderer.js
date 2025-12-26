export const scrollRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
  
      ctx.save();
  
      // Clip region
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
  
      // Translate by scroll offset
      ctx.translate(0, -node.scrollY);
  
      // Render children
      for (const child of node.children) {
        child.render(ctx);
      }
  
      ctx.restore();
    }
  };