export class TextMeasurer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }
    measureText(text, fontSize, constraints = { maxWidth: Infinity, maxHeight: Infinity}  ) {
const px = fontSize * this.canvas.maxHeight
this.ctx.save();
this.ctx.font = `${px}px sans-serif`;
const metrics = this.ctx.measureText(text);
this.ctx.restore();
return {
    width: Math.min(metrics.width, constraints.maxWidth),
    height: Math.min(px*1.2, constraints.maxHeight)
};
    }
}