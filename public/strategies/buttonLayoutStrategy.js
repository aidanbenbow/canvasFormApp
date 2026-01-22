export class ButtonIntrinsicMeasure {
  measure(node, constraints, ctx) {
    const label = node.label ?? "";
    const paddingX = node.style.paddingX ?? 12;
    const paddingY = node.style.paddingY ?? 6;

    ctx.save();
    ctx.font = node.style.font || "12px sans-serif";
    const textWidth = ctx.measureText(label).width;
    ctx.restore();

    const width = Math.min(textWidth + paddingX * 2, constraints.maxWidth);
    const height = Math.min(30, constraints.maxHeight);

    return { width, height };
  }
}

export class ButtonLayoutStrategy {
  constructor() {
    this.intrinsic = new ButtonIntrinsicMeasure();
  }

  measure(node, constraints, ctx) {
    return this.intrinsic.measure(node, constraints, ctx);
  }

  layout(node, bounds) {
    node.bounds = bounds;
  }
}