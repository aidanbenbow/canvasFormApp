import { wrapText } from "../../controllers/textModel.js";

export class InputLayoutStrategy {
  measure(node, constraints, ctx) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const width = node.style.width ?? Math.min(800, constraints.maxWidth);
  
    context.font = node.style.font;
    const maxTextWidth = width - node.style.paddingX * 2;
  
    const lines = wrapText(context, node.value || node.placeholder, maxTextWidth);
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