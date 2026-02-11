export class TextLayoutStrategy {
  measure(node, constraints, ctx) {
    ctx.save();
    ctx.font = node.style.font;
  
    const words = node.text.split(" ");
    const lines = [];
    let line = "";
  
    const fontSize = parseInt(node.style.font, 10);
    const lineHeight = fontSize * (node.style.lineHeight || 1.2);
    const paddingX = node.style.paddingX || 0;
    const paddingY = node.style.paddingY || 0;
    const maxWidth = node.style.maxWidth ?? constraints.maxWidth;
    const shrinkToFit = node.style.shrinkToFit === true;
    let maxLineWidth = 0;
  
    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      const metrics = ctx.measureText(testLine);
  
      if (metrics.width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
  
    ctx.restore();
  
    for (const textLine of lines) {
      const lineWidth = ctx.measureText(textLine).width;
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
    }

    node._lines = lines;
    node._lineHeight = lineHeight;
    node.measured = {
      width: shrinkToFit
        ? Math.min(maxLineWidth + paddingX * 2, maxWidth)
        : maxWidth,
      height: lines.length * lineHeight + (shrinkToFit ? paddingY * 2 : 0)
    };
  
    return node.measured;
  }
  

  layout(node, bounds) {
    node.bounds = bounds;
    node.width = bounds.width;
    node.height = bounds.height;
  }
  
}