export class TextLayoutStrategy {
  measure(node, constraints, ctx) {
    ctx.save();
    ctx.font = node.style.font;

    const metrics = ctx.measureText(node.text);
    const width = Math.min(metrics.width, constraints.maxWidth);
    const height = Math.min(
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      constraints.maxHeight
    );

    ctx.restore();

    return { width, height };
  }

  layout(node, bounds) {
    node.bounds = bounds;
  }
}