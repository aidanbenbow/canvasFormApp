export const textLayoutStrategy = {
    measure(node, constraints, ctx) {
      console.log('Measuring text node:', node);
      ctx.save();
      ctx.font = node.style.font;
  
      const metrics = ctx.measureText(node.text);
      const width = Math.min(metrics.width, constraints.maxWidth);
      const height = Math.min(
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
        constraints.maxHeight
      );
  
      ctx.restore();
  console.log('Measured text node:', { text: node.text, width, height });
      return { width, height };
    },
  
    layout(node, bounds) {
      node.bounds = bounds;
    }
  };