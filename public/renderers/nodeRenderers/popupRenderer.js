export const popupRenderStrategy = {
    render(node, ctx) {
      if (!node.visible) return;
  
      const { x, y, width, height } = node.bounds;
  
      // Draw dimmed background
      ctx.save();
      ctx.fillStyle = node.style.backgroundColor || "rgba(0,0,0,0.5)";
      ctx.fillRect(x, y, width, height);
      ctx.restore();
  
      // Children will render themselves after this
    }
  };