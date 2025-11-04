function resizeCanvas(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  
    const ctx = canvas.getContext('2d');
   // ctx.scale(dpr, dpr);
    return ctx;
  }
  
  export class CanvasManager {
    constructor(config) {
      this.layers = {};
  
      for (const layer in config) {
        const layerConfig = config[layer];
        const mainCanvas = document.querySelector(layerConfig.mainId);
        const hitCanvas = document.querySelector(layerConfig.hitId);
  
        const width = window.innerWidth;
        const height = window.innerHeight;
  
        const ctx = resizeCanvas(mainCanvas, width, height);
        const hitCtx = resizeCanvas(hitCanvas, width, height);
  
        mainCanvas.style.backgroundColor = layerConfig.bg;
        hitCanvas.style.backgroundColor = layerConfig.hitBg;
  
        this.layers[layer] = {
          canvas: mainCanvas,
          hitCanvas: hitCanvas,
          ctx,
          hitCtx,
          bg: layerConfig.bg,
          hitBg: layerConfig.hitBg,
        };
      }
  
      window.addEventListener('resize', () => this.resizeAll());
    }
  
    resizeAll() {
      for (const layer in this.layers) {
        const { canvas, hitCanvas } = this.layers[layer];
        const width = 1000
        const height = 1000
  
        this.layers[layer].ctx = resizeCanvas(canvas, width, height);
        this.layers[layer].hitCtx = resizeCanvas(hitCanvas, width, height);
      }
    }
  
    getContext(layer) {
      return this.layers[layer]?.ctx || null;
    }
  
    getHitContext(layer) {
      return this.layers[layer]?.hitCtx || null;
    }
    getCanvasSize(layer = 'main') {
      const canvas = this.layers[layer]?.canvas;
      if (!canvas) return { width: 0, height: 0 };
    
      const dpr = window.devicePixelRatio || 1;
      return {
        width: canvas.width / dpr,
        height: canvas.height / dpr
      };
    }
  }




