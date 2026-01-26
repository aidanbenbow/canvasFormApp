import { wrapText } from "../../controllers/textModel.js";

export const inputRenderer = {
    render(node, ctx) {
      const { x, y, width, height } = node.bounds;
      const { font, paddingX, paddingY, borderColor, focusBorderColor } = node.style;
  
      ctx.save();
  
      // Border
      ctx.strokeStyle = node.state.focused ? focusBorderColor : borderColor;
      ctx.strokeRect(x, y, width, height);
  
      // Text
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000";
  
      const textX = x + paddingX;
      let textY = y + paddingY;

      const maxTextWidth = width - 2 * paddingX;
      const lines = node.value
        ? wrapText(ctx, node.value, maxTextWidth)
        : wrapText(ctx,node.placeholder,  maxTextWidth);
  
      if (node.value) {
        for(const line of lines) {
          ctx.fillStyle = "#000";
          ctx.fillText(line, textX, textY);
          textY += parseInt(font) + 2; // Move to next line
        }
      } else {
        ctx.fillStyle = "#888";
        ctx.fillText(node.placeholder, textX, textY);
      }
  
      // Cursor
      if (node.state.focused) {
        const textWidth = ctx.measureText(node.value).width;
        ctx.beginPath();
        ctx.moveTo(textX + textWidth + 1, textY);
        ctx.lineTo(textX + textWidth + 1, textY + parseInt(font));
        ctx.stroke();
      }
  
      ctx.restore();
    }
  };