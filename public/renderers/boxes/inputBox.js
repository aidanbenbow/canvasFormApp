import { BoxRenderer } from "./basicBox.js";

export class InputBoxRenderer extends BoxRenderer {
  render(box, rendererContext) {
    const { ctx, hitCtx, textEditorController, boxHitManager } = rendererContext;
    const { x, y } = box.startPosition;
    const { width, height } = box.size;

    // Main box
    ctx.fillStyle = box.fill;
    ctx.fillRect(x, y, width, height);

    // Label
    ctx.fillStyle = 'black';
    ctx.font = `${box.fontSize * 0.6}px Arial`;
    ctx.fillText(`${box.label}`, x + 10, y + box.fontSize);

    // Input field
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 60, y + 10, width - 70, height - 20);
    ctx.strokeStyle = 'gray';
    ctx.strokeRect(x + 60, y + 10, width - 70, height - 20);

    // Text inside input
    ctx.fillStyle = 'black';
    ctx.fillText(box.text, x + 65, y + height / 2);

    // Hit regions
    hitCtx.fillStyle = box.hitColors.label;
    hitCtx.fillRect(x + 10, y + 10, 50, box.fontSize + 5);

    hitCtx.fillStyle = box.hitColors.text;
    hitCtx.fillRect(x + 60, y + 10, width - 70, height - 20);

    // Shared overlays
    this.renderCommon(box, ctx, hitCtx, textEditorController, boxHitManager);
  }
}