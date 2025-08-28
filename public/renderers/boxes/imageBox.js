import { BoxRenderer } from "./basicBox.js";


export class ImageBoxRenderer extends BoxRenderer {
    render(box, rendererContext) {
        const { ctx, hitCtx, boxHitManager } = rendererContext;
        const { x, y } = box.startPosition;
        const { width, height } = box.size;

        // Draw background fill (optional, for debugging or fallback)
        ctx.fillStyle = box.fill || 'transparent';
        ctx.fillRect(x, y, width, height);

        // Draw image if available
        if (box.image instanceof Image && box.image.complete) {
            ctx.drawImage(box.image, x, y, width, height);
        } else {
            // Optional fallback: draw placeholder or border
            ctx.strokeStyle = 'red';
            ctx.strokeRect(x, y, width, height);
            ctx.font = '12px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText('Image not loaded', x + 10, y + 20);
        }

        // Hit region for interaction
        hitCtx.fillStyle = box.hitColors.image;
        hitCtx.fillRect(x, y, width, height);

        // Shared overlays and gizmos
        this.renderCommon(box, ctx, hitCtx, null, boxHitManager);
    }
}