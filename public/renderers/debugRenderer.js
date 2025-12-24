export const debugContainerRenderer = {
    render(node, ctx) {
      const b = node.bounds;
      if (!b) return;
  
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
      ctx.strokeRect(b.x, b.y, b.width, b.height);
  
      ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText(node.id, b.x + 4, b.y + 12);
      ctx.restore();
    }
  };
  