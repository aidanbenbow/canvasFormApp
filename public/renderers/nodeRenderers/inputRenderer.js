import { wrapText } from "../../controllers/textModel.js";

export const inputRenderer = {
    render(node, ctx) {
    //  logUIState(node);
      const { x, y, width, height } = node.bounds;
      const {
        font,
        paddingX,
        paddingY,
        borderColor,
        focusBorderColor,
        textColor = "#111",
        placeholderColor = "#999"
      } = node.style;
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
      ctx.fillStyle = textColor;
  
      const textX = x + paddingX;
      let textY = y + paddingY;

     const { lines, lineHeight} = node._layout 

     for (const line of lines) {
      const isPlaceholder = !node.value && !focused;
      ctx.fillStyle = isPlaceholder ? placeholderColor : textColor;
      if (!focused || node.value) {
        ctx.fillText(line.text, textX, textY);
      }
      textY += lineHeight;
    }
  
      ctx.restore();
    }
  };

  function logUIState(node) {
    const state = node.uiState || {};
    console.log(
      `Node "${node.id}" UI State → focused: ${state.focused}, hovered: ${state.hovered}, active: ${state.active}, pressed: ${state.pressed}`
    );
  }
  