export class RenderPipeline {
    constructor(renderManager) {
      this.renderManager = renderManager;
      this.rendererContext = null;
      this.root = null; // root SceneNode
      this.dirty = true;
      this.running = false;
      this.constraints = { maxWidth: Infinity, maxHeight: Infinity };
      this.editor = null;
    }
  
    setRendererContext(rendererContext) {
      this.rendererContext = rendererContext;
    }

    setEditor(editor) {
      this.editor = editor;
    }
  
    setRoot(rootNode) {
      // 1. Detach old root
      if (this.root) {
        this.root.off("invalidate", this._invalidateHandler);
      }
    
      // 2. Attach new root
      this.root = rootNode;
    console.log("RenderPipeline: New root set:", rootNode);
      // Keep a reference to the handler so we can remove it later
      this._invalidateHandler = () => this.invalidate();
      rootNode.on("invalidate", this._invalidateHandler);
    
      // 3. Force redraw
      this.invalidate();
    }
  
    invalidate() {
      this.dirty = true;
    }
  
    tick(dt, constraints) {
      if (!this.root) return;

      // 1. Measure
      this.root.measure( constraints, this.rendererContext);
  
      // 2. Layout
      this.root.layout(
        { x: 0, y: 0, width: constraints.maxWidth, height: constraints.maxHeight },
        this.rendererContext
      );
  
      // 3. Update
      this.root.update(dt, this.rendererContext);
  this.updateScrollableNodes(this.root);
      // 4. Render
      this.renderFrame();
    }
    updateScrollableNodes(node) {
      if (node.scroll) node.updateScroll();
      for (const child of node.children) {
        this.updateScrollableNodes(child);
      }
    }
    renderFrame() {
      
      if (!this.dirty) return;
      this.renderManager.clearAll(this.rendererContext);
      if (this.root) {
        this.root.render(this.rendererContext);
      }

      if( this.editor ) {
        this.editor.renderOverlay(this.rendererContext);
      }

      this.dirty = false;
    }
  
    start(constraints) {
      this.constraints = constraints;
      if (this.running) return;
      this.running = true;
      let lastTime = performance.now();
  
      const loop = (time) => {
        const dt = time - lastTime;
        lastTime = time;
        this.tick(dt, constraints);
        requestAnimationFrame(loop);
      };
  
      requestAnimationFrame(loop);
    }
  
    stop() {
      this.running = false;
    }
    toSceneCoords(canvasX, canvasY) {
      const scaleX = this.constraints.maxWidth / this.rendererContext.canvas.width;
      const scaleY = this.constraints.maxHeight / this.rendererContext.canvas.height;
    
      return {
        x: canvasX * scaleX,
        y: canvasY * scaleY
      };
    }
  }
