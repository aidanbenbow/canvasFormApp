export class RendererContext {
    constructor({ ctx, hitCtx, pipeline, textEditorController, selectionController, interactionManager, focusManager, boxManager, boxHitManager }) {
        this.ctx = ctx;
        this.hitCtx = hitCtx;
        this.pipeline = pipeline;
        this.textEditorController = textEditorController;
        this.selectionController = selectionController;
        this.interactionManager = interactionManager;
        this.focusManager = focusManager;
        this.boxManager = boxManager;
        this.boxHitManager = boxHitManager;
    }
}