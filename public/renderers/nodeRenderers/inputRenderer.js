import { wrapText } from "../../controllers/textModel.js";

export const inputRenderer = {
    render(node, ctx) {
    //  logUIState(node);
      const { x, y, width, height } = node.bounds;
      const {
        font,
        paddingX,
        paddingY,
        wordCountEnabled,
        wordCountFont,
        wordCountColor,
        wordCountSpacing,
        wordCountMax,
        borderColor,
        focusBorderColor,
        textColor = "#111",
        placeholderColor = "#999"
      } = node.style;
  const uiState = node.uiState || {};
  const focused = uiState.focused || false;

      ctx.save();
  
      const layout = node._layout || {};
      const wcHeight = layout.wordCountHeight ?? 0;
      const wcSpacing = layout.wordCountSpacing ?? 0;
      const wcFontSize = layout.wordCountFontSize ?? (parseInt(wordCountFont || font, 10) || 0);
      const boxY = y + (wcHeight > 0 ? wcHeight + wcSpacing : 0);
      const boxHeight = height - (boxY - y);

      // Word count (above input box)
      if (wordCountEnabled) {
        const rawText = (node.value || "").toString().trim();
        const count = rawText ? rawText.split(/\s+/).length : 0;
        const maxSuffix = typeof wordCountMax === "number" ? `/${wordCountMax}` : "";
        ctx.font = wordCountFont || font;
        ctx.fillStyle = wordCountColor || "#6b7280";
        ctx.textBaseline = "top";
        const wcY = y + Math.max(0, Math.floor((wcHeight - wcFontSize) / 2));
        ctx.fillText(`Words: ${count}${maxSuffix}`, x + paddingX, wcY);
      }

      // Border
      ctx.strokeStyle = focused ? focusBorderColor : borderColor;
      ctx.lineWidth = 1;
      ctx.fillStyle = "#fff"; // white background
      ctx.fillRect(x, boxY, width, boxHeight);
      ctx.strokeRect(x, boxY, width, boxHeight);
  
      // Text
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = textColor;
  
      const textX = x + paddingX;
      let textY = boxY + paddingY;
      const textBottom = boxY + boxHeight - paddingY;

         const { lines, lineHeight } = node._layout || { lines: [], lineHeight: 0 };

      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 1, boxY + 1, Math.max(0, width - 2), Math.max(0, boxHeight - 2));
      ctx.clip();

     for (const line of lines) {
      if (textY + lineHeight > textBottom) break;
      const isPlaceholder = !node.value && !focused;
      ctx.fillStyle = isPlaceholder ? placeholderColor : textColor;
      if (!focused || node.value) {
        ctx.fillText(line.text, textX, textY);
      }
      textY += lineHeight;
    }

      ctx.restore();
  
      ctx.restore();
    }
  };

  function logUIState(node) {
    const state = node.uiState || {};
    console.log(
      `Node "${node.id}" UI State → focused: ${state.focused}, hovered: ${state.hovered}, active: ${state.active}, pressed: ${state.pressed}`
    );
  }
  