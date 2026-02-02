// dropdownMenuRenderer.js
export const dropdownMenuRenderStrategy = {
  render(node, ctx) {
    if (!node.visible) return;

    const { x, y, width, height } = node.bounds;

    ctx.save();

    // Optional: draw subtle border/background for menu container
    ctx.strokeStyle = node.style?.borderColor ?? "#ccc";
    ctx.lineWidth = 1;
    ctx.fillStyle = node.style?.backgroundColor ?? "transparent"; // fully transparent by default
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    ctx.restore();

    // The children (LabelNodes) render themselves
  }
};
