import { BoxRenderer } from "./basicBox.js";


export class TextBoxRenderer extends BoxRenderer {
    render(box, rendererContext) {
      const { ctx, hitCtx, textEditorController, boxHitManager } = rendererContext;
      const { x, y } = box.startPosition;
      const { width, height } = box.size;
     
      ctx.fillStyle = box.fill;
      ctx.fillRect(x, y, width, height);
  
      ctx.fillStyle = 'black';
      ctx.font = `${box.fontSize}px Arial`;
      ctx.fillText(box.text, x + 10, y + 20);
  
      this.renderCommon(box, ctx, hitCtx, textEditorController, boxHitManager);
    }
  }
  