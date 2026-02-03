

export class RendererContext {
    constructor({ ctx, hitCtx, hitRegistry, hitManager, pipeline, textEditorController, selectionController, focusManager,assetRegistry, canvas, uiState, dragController }) {
        this.ctx = ctx;
        this.hitCtx = hitCtx;
        this.hitRegistry = hitRegistry;
        this.hitManager = hitManager;
        this.pipeline = pipeline;
        this.textEditorController = textEditorController;
        this.selectionController = selectionController;
      
        this.focusManager = focusManager;
        this.assetRegistry = assetRegistry;
        this.canvas = canvas;
        this.uiState = uiState;
        this.dragController = dragController;
        
    }
}