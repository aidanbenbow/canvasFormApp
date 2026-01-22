export class InputLayoutStrategy {
  measure(node, constraints, ctx) {
    const width =
      node.style.width ??
      Math.min(200, constraints.maxWidth);

    const height =
      node.style.height ??
      Math.min(32, constraints.maxHeight);

    return { width, height };
  }

  layout(node, bounds) {
    node.bounds = bounds;
  }
}