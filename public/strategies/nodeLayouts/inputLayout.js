import { wrapText, wrapTextByWords } from "../../controllers/textModel.js";

export class InputLayoutStrategy {
  measure(node, constraints, ctx) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const preferredWidth = node.style.width ?? 800;
    const width = node.style.fillWidth
      ? constraints.maxWidth
      : Math.min(preferredWidth, constraints.maxWidth);
  
    context.font = node.style.font;
    const maxTextWidth = width - node.style.paddingX * 2;
  
   
    const focused = node.uiState?.focused || false;
    const displayText = node.value || (focused ? "" : node.placeholder);
    const lines = wrapTextByWords(context, displayText, maxTextWidth);
    if (lines.length === 0) {
      lines.push({ text: "", startIndex: 0, endIndex: 0 });
    }
    const lineHeight = parseInt(node.style.font) + 2;
  
    const contentHeight = lines.length * lineHeight + node.style.paddingY * 2;

    node._layout = { lines, lineHeight };
  
    const minHeight = node.style.minHeight ?? 32;

  const rawHeight = Math.max(minHeight, contentHeight);
  const height = Math.min(rawHeight, constraints.maxHeight);
 
    return { width, height };
  }

  layout(node, bounds) {
    node.bounds = bounds;
  }
}