export class RenderPipeline {
    constructor(renderManager) {
      this.renderManager = renderManager;
      this.rendererContext = null;
      this.root = null; // root SceneNode
      this.dirty = true;
      this.running = false;
      this.constraints = { maxWidth: Infinity, maxHeight: Infinity };
    }
  
    setRendererContext(rendererContext) {
      this.rendererContext = rendererContext;
    }
  
    setRoot(rootNode) {
      this.root = rootNode;
      rootNode.on('invalidate', () => this.invalidate());
      this.invalidate();
    }
  
    invalidate() {
      this.dirty = true;
    }
  
    tick(dt, constraints) {
      if (!this.root) return;

      // 1. Measure
      this.root.measure(this.rendererContext, constraints);
  
      // 2. Layout
      this.root.layout(
        { x: 0, y: 0, width: constraints.maxWidth, height: constraints.maxHeight },
        this.rendererContext
      );
  
      // 3. Update
      this.root.update(dt, this.rendererContext);
  
      // 4. Render
      this.renderFrame();
    }
  
    renderFrame() {
      if (!this.dirty) return;
      this.renderManager.clearAll(this.rendererContext);
      if (this.root) {
        this.root.render(this.rendererContext);
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
