export const textRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
      const { font, color } = node.style;
  
      ctx.save();
      ctx.font = font;
      ctx.fillStyle = color;
  
      // Baseline at top-left
      ctx.textBaseline = "top";
      ctx.fillText(node.text, x, y);
  
      ctx.restore();
    }
  };