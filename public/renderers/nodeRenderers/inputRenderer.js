import { wrapText } from "../../controllers/textModel.js";

export const inputRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
      const { font, paddingX, paddingY, borderColor, focusBorderColor } = node.style;
  const uiState = node.uiState || {};
  const focused = uiState.focused || false;
  
      ctx.save();
  
      // Border
      ctx.strokeStyle = focused ? focusBorderColor : borderColor;
      ctx.lineWidth = 1;
      ctx.fillStyle = "#fff"; // white background
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
  
      // Text
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000";
  
      const textX = x + paddingX;
      let textY = y + paddingY;

     const { lines, lineHeight} = node._layout 

     for (const line of lines) {
      ctx.fillStyle = node.value ? "#000" : "#888";
      ctx.fillText(line, textX, textY);
      textY += lineHeight;
    }
  
      ctx.restore();
    }
  };