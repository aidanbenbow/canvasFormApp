import { utilsRegister } from "../../utils/register.js";




export class BoxRenderer {
  measureTextSize(text, fontSize, maxWidth = Infinity) {
    const measureTextUtil = utilsRegister.get('text', 'measureTextSize');
    const labelWidth = measureTextUtil(this.label, fontSize * 0.6).width;
    const textWidth = measureTextUtil(text, fontSize).width;
    const padding = 80; // label + spacing + input padding
  
    return {
      width: Math.min(labelWidth + textWidth + padding, maxWidth),
      height: fontSize + 20
    };
  }


    renderCommon(box, ctx, hitCtx, textEditorController, boxHitManager) {
      const { x, y } = box.startPosition;
      const { width, height } = box.size;
  
      // Draw hit region
      // if (box.hitColors?.main) {
      //   hitCtx.fillStyle = box.hitColors.main;
      //   hitCtx.fillRect(x, y, width, height);
      // }
 
      // Selection overlays
      if (textEditorController?.activeBox === box) {
       
        textEditorController.drawSelection(ctx);
        textEditorController.drawCaret(ctx);
      }
  
      // Gizmo logic
      if (box.select) {
        if (!box.Gizmo) {
          box.Gizmo = new Gizmo(box.getCentre());
        }
        box.Gizmo.draw(ctx, hitCtx);
        if (!box._gizmoRegistered) {
          boxHitManager.registerGizmoHits(box);
          box._gizmoRegistered = true;
        }
      }
    }
  }