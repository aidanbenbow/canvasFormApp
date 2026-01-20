export const inputLayoutStrategy = {
  measure(node, constraints, ctx) {
    const width =
      node.style.width ??
      Math.min(200, constraints.maxWidth);   // default width

    const height =
      node.style.height ??
      Math.min(32, constraints.maxHeight);   // default height

    return { width, height };
  },

  layout(node, bounds) {
    node.bounds = bounds;
  }
};

