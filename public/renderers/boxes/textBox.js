import { BoxRenderer } from "./basicBox.js";


export class TextBoxRenderer extends BoxRenderer {
    render(box, rendererContext) {
      const { ctx, hitCtx, textEditorController, boxHitManager, hitRegistry } = rendererContext;
      const { x, y } = box.startPosition;
      const { width, height } = box.size;
     
      ctx.fillStyle = box.fill;
      ctx.fillRect(x, y, width, height);
  
      ctx.fillStyle = 'black';
      ctx.font = `${box.fontSize}px Arial`;
      ctx.fillText(box.text, x + 10, y + 20);

      // Hit regions
      hitCtx.fillStyle = box.hitColors.main;
      hitCtx.fillRect(x, y, width, height);
      // Register hit region actions
      hitRegistry?.register(box.hitColors.main, {
        box,
        region: 'main',
        metadata: { actionKey: box.actionKey }
      });
  
      this.renderCommon(box, ctx, hitCtx, textEditorController, boxHitManager);
    }
  }
  