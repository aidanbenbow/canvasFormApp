export class RendererContext {
    constructor({ ctx, hitCtx, hitRegistry, pipeline, textEditorController, selectionController, interactionManager, focusManager, boxManager, boxHitManager, assetRegistry }) {
        this.ctx = ctx;
        this.hitCtx = hitCtx;
        this.hitRegistry = hitRegistry;
        this.pipeline = pipeline;
        this.textEditorController = textEditorController;
        this.selectionController = selectionController;
        this.interactionManager = interactionManager;
        this.focusManager = focusManager;
        this.boxManager = boxManager;
        this.boxHitManager = boxHitManager;
        this.assetRegistry = assetRegistry;
    }
}