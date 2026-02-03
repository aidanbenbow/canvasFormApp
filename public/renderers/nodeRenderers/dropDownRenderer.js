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
 
      // --- 4. Draw dropdown menu if visible ---
      if (node.dropdownVisible) {
        const optionHeight = 24;

        // Background & border
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#ccc";
        ctx.fillRect(x, y + height, width, node.options.length * optionHeight);
        ctx.strokeRect(x, y + height, width, node.options.length * optionHeight);
  
        // Draw each option
        node.options.forEach((opt, i) => {
          // Highlight selected
          if (i === node.selectedIndex) {
            ctx.fillStyle = "rgba(0, 120, 215, 0.8)";
            ctx.fillRect(x, y + height + i * optionHeight, width, optionHeight);
          }
  
          // Option text
          ctx.fillStyle = "#000";
          ctx.textBaseline = "middle";
          ctx.fillText(opt, x + paddingX, y + height + i * optionHeight + optionHeight / 2);
        });
      }
  
      ctx.restore();
    }
  };
  