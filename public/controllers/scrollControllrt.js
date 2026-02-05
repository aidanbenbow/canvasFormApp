export class ScrollController {
    constructor({ contentHeight=0, viewportHeight=0 }={}) {
      this.offsetY = 0;
      this.contentHeight = contentHeight;
      this.viewportHeight = viewportHeight;
    }
    setViewportHeight(height) {
      this.viewportHeight = height;
      this.clamp();
    }
    setContentHeight(height) {
      this.contentHeight = height;
      this.clamp();
    }
    clamp() {
     const maxOffset = Math.max(0, this.contentHeight - this.viewportHeight);
     if(this.offsetY < 0) this.offsetY = 0;
      if(this.offsetY > maxOffset) this.offsetY = maxOffset;
    }
  
    scrollBy(delta) {
     
      this.offsetY += delta;
      this.clamp();
    }
  
    apply(ctx,{scaleY=1}={}) {
      console.log("Applying scroll offset:", this.offsetY);
      const pixelOffsetY = this.offsetY * scaleY;
      ctx.translate(0, -pixelOffsetY);
    }
  }
  