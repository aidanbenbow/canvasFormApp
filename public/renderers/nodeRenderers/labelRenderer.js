
  export const labelRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;

      const uiState = node.uiState || {};
      const hovered = uiState.hovered ?? false;
      const selected = uiState.selected ?? false; // optional
      const pressed = uiState.pressed ?? false;
  
      // Default background
      ctx.fillStyle = node.style.backgroundColor ?? "#fff"; // white if not specified
      ctx.fillRect(x, y, width, height);
  
       // Selected highlight
    if (selected) {
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(x, y, width, height);
    }

    // Hover highlight (only if not selected)
    if (hovered && !selected) {
      ctx.fillStyle = "#eef6ff";
      ctx.fillRect(x, y, width, height);
    }

    // Pressed highlight (optional, but feels good)
    if (pressed) {
      ctx.fillStyle = "#dbeaff";
      ctx.fillRect(x, y, width, height);
    }
  
      // Text
      ctx.fillStyle = node.style.textColor ?? "#000";
      ctx.font = node.style.font;
      ctx.textBaseline = "middle";
      ctx.fillText(node.text, x + node.style.paddingX, y + height / 2);
    }
  };
  