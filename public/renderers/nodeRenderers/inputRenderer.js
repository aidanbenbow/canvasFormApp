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
      const textY = y + paddingY;
  
      if (node.value) {
        ctx.fillText(node.value, textX, textY);
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