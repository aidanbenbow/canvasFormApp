export class CanvasManager{
    constructor(config){
        this.layers = {};
        for(const layer in config){
const mainCanvas = document.querySelector(config[layer].mainId);
const hitCanvas = document.querySelector(config[layer].hitId);
mainCanvas.width = config[layer].width;
hitCanvas.width = config[layer].width;
mainCanvas.height = config[layer].height;
hitCanvas.height = config[layer].height;

            this.layers[layer] = {
                canvas: mainCanvas,
                hitCanvas: hitCanvas,
                ctx: mainCanvas.getContext('2d'),
                hitCtx: hitCanvas.getContext('2d'),
                bg: config[layer].bg,
                hitBg: config[layer].hitBg,
            };

            mainCanvas.style.backgroundColor = config[layer].bg;
            hitCanvas.style.backgroundColor = config[layer].hitBg;
          
        } 
    }
    getContext(layer){
        return this.layers[layer]?.ctx || null;
    }
    getHitContext(layer){
        return this.layers[layer]?.hitCtx || null;
    }
}