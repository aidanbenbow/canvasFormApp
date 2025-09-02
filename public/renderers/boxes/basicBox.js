export class BoxRenderer {
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