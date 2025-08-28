export class RendererSystem {
    constructor(pipeline) {
      this.pipeline = pipeline;
    }
  
    addDrawable(drawable) {
      this.pipeline.add(drawable);
    }
  
    removeDrawable(drawable) {
      this.pipeline.remove(drawable);
    }
  
    start() {
      this.pipeline.start();
    }
  
    stop() {
      this.pipeline.stop();
    }
  
    clearOverlay() {
      this.pipeline.clearOverlay();
    }
  }