import { wrapTextByWords } from "../../controllers/textModel.js";

export class TextLayoutStrategy {
  measure(node, constraints, ctx) {
    ctx.save();
    const defaultFont = node.style.font;
    const defaultColor = node.style.color;

    const paddingX = node.style.paddingX || 0;
    const paddingY = node.style.paddingY || 0;
    const maxWidth = node.style.maxWidth ?? constraints.maxWidth;
    const shrinkToFit = node.style.shrinkToFit === true;
    const lineHeightScale = node.style.lineHeight || 1.2;

    const lines = [];
    let currentLine = { segments: [], width: 0, height: 0 };
    let maxLineWidth = 0;

    const getFontSize = (fontValue) => {
      const size = parseInt(fontValue, 10);
      return Number.isFinite(size) ? size : 16;
    };

    const pushLine = () => {
      if (!currentLine.segments.length) return;
      lines.push(currentLine);
      if (currentLine.width > maxLineWidth) maxLineWidth = currentLine.width;
      currentLine = { segments: [], width: 0, height: 0 };
    };

    const addToken = (token) => {
      if (token.type === "newline") {
        pushLine();
        return;
      }

      const text = token.text;
      if (!text) return;

      const isSpace = token.isSpace === true;
      if (isSpace && currentLine.segments.length === 0) return;

      ctx.font = token.font;
      const width = ctx.measureText(text).width;
      if (currentLine.width + width > maxWidth && currentLine.segments.length > 0 && !isSpace) {
        pushLine();
      }

      const fontSize = getFontSize(token.font);
      currentLine.height = Math.max(currentLine.height, fontSize * lineHeightScale);
      currentLine.segments.push({
        text,
        font: token.font,
        color: token.color,
        width
      });
      currentLine.width += width;
    };

    const tokenizeText = (text, font, color) => {
      const parts = text.split("\n");
      parts.forEach((part, index) => {
        const pieces = part.split(/(\s+)/);
        pieces.forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) {
            addToken({ type: "text", text: " ", isSpace: true, font, color });
            return;
          }
          addToken({ type: "text", text: piece, font, color });
        });
        if (index < parts.length - 1) {
          addToken({ type: "newline" });
        }
      });
    };

    const fullText = Array.isArray(node.runs) && node.runs.length > 0
      ? node.runs.map((run) => (run?.text ?? "")).join("")
      : (node.text ?? "").toString();

    if (Array.isArray(node.runs) && node.runs.length > 0) {
      node.runs.forEach((run) => {
        const runText = (run?.text ?? "").toString();
        if (!runText) return;
        const font = run.font || defaultFont;
        const color = run.color || defaultColor;
        tokenizeText(runText, font, color);
      });
    } else {
      const text = (node.text ?? "").toString();
      tokenizeText(text, defaultFont, defaultColor);
    }

    pushLine();
    if (!lines.length) {
      const fontSize = getFontSize(defaultFont);
      lines.push({ segments: [], width: 0, height: fontSize * lineHeightScale });
    }

    ctx.restore();

    const maxTextWidth = Math.max(0, maxWidth - paddingX * 2);
    const caretLines = wrapTextByWords(ctx, fullText, maxTextWidth);
    if (caretLines.length === 0) {
      caretLines.push({ text: "", startIndex: 0, endIndex: 0 });
    }
    const caretFontSize = getFontSize(defaultFont);
    const caretLineHeight = caretFontSize * lineHeightScale;
    node._layout = { lines: caretLines, lineHeight: caretLineHeight };

    node._renderLines = lines;
    node._lines = lines;
    node.measured = {
      width: shrinkToFit
        ? Math.min(maxLineWidth + paddingX * 2, maxWidth)
        : maxWidth,
      height: lines.reduce((sum, line) => sum + line.height, 0) + (shrinkToFit ? paddingY * 2 : 0)
    };

    return node.measured;
  }
  

  layout(node, bounds) {
    node.bounds = bounds;
    node.width = bounds.width;
    node.height = bounds.height;
  }
  
}