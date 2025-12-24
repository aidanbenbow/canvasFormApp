export const containerRenderer = {
    render(node, ctx) {
      const b = node.bounds;
      if (!b) return;
  
      ctx.save();
  
      if (node.style?.clip) {
        ctx.beginPath();
        ctx.rect(b.x, b.y, b.width, b.height);
        ctx.clip();
      }
  
      if (node.style?.background) {
        ctx.fillStyle = node.style.background;
        ctx.fillRect(b.x, b.y, b.width, b.height);
      }
  
      if (node.style?.border) {
        const { color = '#000', width = 1 } = node.style.border;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      }
  
      ctx.restore();
    }
  };
  