export class TextLayoutStrategy {
  measure(node, constraints, ctx) {
    ctx.save();
    ctx.font = node.style.font;
  
    const words = node.text.split(" ");
    const lines = [];
    let line = "";
  
    const fontSize = parseInt(node.style.font, 10);
    const lineHeight = fontSize * (node.style.lineHeight || 1.2);
  
    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      const metrics = ctx.measureText(testLine);
  
      if (metrics.width > constraints.maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
  
    ctx.restore();
  
    node._lines = lines;
    node.measured = {
      width: constraints.maxWidth,  // or max line width if you want tighter bounds
      height: lines.length * lineHeight
    };
  
    return node.measured;
  }
  

  layout(node, bounds) {
    node.bounds = bounds;
    node.width = bounds.width;
    node.height = bounds.height;
  }
  
}