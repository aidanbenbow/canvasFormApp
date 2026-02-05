export const dropdownInputRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
      const { font, paddingX, paddingY, borderColor, focusBorderColor } = node.style;
  const uiState = node.uiState || {};
  const focused = uiState.focused || false;
      ctx.save();
  
      // --- 1. Draw input box border ---
      ctx.strokeStyle = focused ? focusBorderColor : borderColor;
      ctx.strokeRect(x, y, width, height);
  
      // --- 2. Draw input text ---
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = node.value ? "#000" : "#888"; // placeholder color
      ctx.fillText(node.value || node.placeholder, x + paddingX, y + paddingY);
  
      // --- 3. Draw dropdown arrow ---
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(x + width - 14, y + height / 2 - 3);
      ctx.lineTo(x + width - 6, y + height / 2 - 3);
      ctx.lineTo(x + width - 10, y + height / 2 + 3);
      ctx.closePath();
      ctx.fill();
 
  
      ctx.restore();
    }
  };
  