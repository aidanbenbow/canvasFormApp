export class RendererContext {
    constructor({ ctx, hitCtx, hitRegistry, hitManager, pipeline, textEditorController, selectionController, interactionManager, focusManager, boxManager, boxHitManager, assetRegistry, canvas, uiStage, dragController }) {
        this.ctx = ctx;
        this.hitCtx = hitCtx;
        this.hitRegistry = hitRegistry;
        this.hitManager = hitManager;
        this.pipeline = pipeline;
        this.textEditorController = textEditorController;
        this.selectionController = selectionController;
        this.interactionManager = interactionManager;
        this.focusManager = focusManager;
        this.boxManager = boxManager;
        this.boxHitManager = boxHitManager;
        this.assetRegistry = assetRegistry;
        this.canvas = canvas;
        this.uiStage = uiStage;
        this.dragController = dragController;
    }
}