// dropdownMenuRenderer.js
export const dropdownMenuRenderStrategy = {
  render(node, ctx) {
    if (!node.visible) return;

    const { x, y, width, height } = node.bounds;
    const optionHeight = node.anchor?.style?.optionHeight ?? 24;
    ctx.save();

     // menu container background + border
     ctx.strokeStyle = node.style?.borderColor ?? "#ccc";
     ctx.lineWidth = 1;
     ctx.fillStyle = node.style?.backgroundColor ?? "#fff";
     ctx.fillRect(x, y, width, height);
     ctx.strokeRect(x, y, width, height);
 
     // highlight selected row
     if (node.selectedIndex >= 0) {
       ctx.fillStyle = "rgba(0, 120, 215, 0.25)";
       ctx.fillRect(
         x,
         y + node.selectedIndex * optionHeight,
         width,
         optionHeight
       );
     }

    ctx.restore();

    // The children (LabelNodes) render themselves
  }
};
