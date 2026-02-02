
  export const labelRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
  
      // Default background
      ctx.fillStyle = node.style.backgroundColor ?? "#fff"; // white if not specified
      ctx.fillRect(x, y, width, height);
  
      // Selected highlight
      if (node.state.selected) {
        ctx.fillStyle = "#e8e8e8"; // light blue
        ctx.fillRect(x, y, width, height);
      }
  
      // Hover highlight (on top of default but below selected)
      if (node.state.hovered && !node.state.selected) {
        ctx.fillStyle = "#eef6ff";
        ctx.fillRect(x, y, width, height);
      }
  
      // Text
      ctx.fillStyle = node.style.textColor ?? "#000";
      ctx.font = node.style.font;
      ctx.textBaseline = "middle";
      ctx.fillText(node.text, x + node.style.paddingX, y + height / 2);
    }
  };
  