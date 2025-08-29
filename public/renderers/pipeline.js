export class RenderPipeline {
    constructor(renderManager) {
        this.renderManager = renderManager;
        this.rendererContext = null; // Context for rendering, e.g., canvas context
        this.drawables = new Set();
        this.dirty = true;
        this.running = false;
    }
    setRendererContext(rendererContext) {
        this.rendererContext = rendererContext;
    }

    add(drawable) {
        this.drawables.add(drawable);
        this.invalidate();
    }

    remove(drawable) {
        this.drawables.delete(drawable);
        this.invalidate();
    }

    invalidate() {
        this.dirty = true;
    }

    renderFrame() {
        
        if (!this.dirty) return;
console.log('Rendering frame with', this.drawables.size, 'drawables');
        this.renderManager.clearAll(this.rendererContext); // Clear all layers
        for (const drawable of this.drawables) {
           
            this.renderManager.render(drawable, this.rendererContext); // Dispatch to correct renderer
        }

        this.dirty = false;
    }

    start() {
        if (this.running) return;
        this.running = true;
        const loop = () => {
            this.renderFrame();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    stop() {
        this.running = false;
    }
    clearOverlay() {
        for (const drawable of this.drawables) {
            if (drawable.type === 'colorPicker' || drawable.isOverlay) {
                this.drawables.delete(drawable);
            }
        }
        this.invalidate();
    }
    clearAll() {
        this.drawables.clear();
        this.invalidate();
    }
}

