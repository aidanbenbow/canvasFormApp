export const popupRenderStrategy = {
    render(node, ctx) {
      if (!node.visible) return;
  
      const { x, y, width, height } = node.bounds;
  
      // Draw dimmed background
      ctx.save();
      if (node.style.backgroundColor) {
        ctx.fillStyle = node.style.backgroundColor;
        ctx.fillRect(x, y, width, height);
      }
      ctx.restore();
  
      // Children will render themselves after this
    }
  };