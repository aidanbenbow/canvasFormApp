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

    remove(...drawables) {
        for (const d of drawables) {
          
          this.drawables.delete(d);
        }
        this.invalidate();
      }

    invalidate() {
        this.dirty = true;
    }

    renderFrame() {
        
        if (!this.dirty) return;
        
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
    clearExcept(targetBox) {
        // Filter drawables to keep only the clicked box
        this.drawables = new Set([...this.drawables].filter(box => box === targetBox));
      
        this.invalidate();
      }
      clearExceptById(targetId) {
        this.drawables = new Set([...this.drawables].filter(box => box.id === targetId|| box.isOverlay));
        this.invalidate();
      }
}

