export class ScrollController {
    constructor({ contentHeight, viewportHeight }) {
      this.offsetY = 0;
      this.contentHeight = contentHeight;
      this.viewportHeight = viewportHeight;
    }
  
    scrollBy(delta) {
      this.offsetY = Math.max(0, Math.min(this.offsetY + delta, this.contentHeight - this.viewportHeight));
    }
  
    apply(ctx) {
      ctx.translate(0, -this.offsetY);
    }
  }
  