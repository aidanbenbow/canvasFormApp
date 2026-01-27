export const labelRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
  
      // Selected highlight
      if (node.state.selected) {
        ctx.fillStyle = "#e8e8e8"; // light blue
        ctx.fillRect(x, y, width, height);
      }
  
      // Hover highlight
      if (node.state.hovered && !node.state.selected) {
        ctx.fillStyle = "#eef6ff";
        ctx.fillRect(x, y, width, height);
      }
  
      // Text
      ctx.fillStyle = "#000";
      ctx.font = node.style.font;
      ctx.fillText(node.text, x + node.style.paddingX, y + height / 2 + 4);
    }
  };