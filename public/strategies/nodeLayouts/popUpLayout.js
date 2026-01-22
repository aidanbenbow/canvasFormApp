export class PopupLayoutStrategy {
  measure(node, constraints, ctx) {
    const width = constraints.maxWidth;
    const height = constraints.maxHeight;

    for (const child of node.children) {
      child.measure({ maxWidth: width, maxHeight: height }, ctx);
    }

    return { width, height };
  }

  layout(node, bounds, ctx) {
    node.bounds = bounds;

    for (const child of node.children) {
      const size = child.measured;

      child.layout({
        x: bounds.x + (bounds.width - size.width) / 2,
        y: bounds.y + (bounds.height - size.height) / 2,
        width: size.width,
        height: size.height
      }, ctx);
    }
  }
}