import { canvasConfig } from "./constants.js";
import { CanvasManager } from "./managers/canvas.js";


const canvas = new CanvasManager(canvasConfig)
const forms = document.querySelector('#data')
const data = forms.innerHTML
console.log(data);
console.log(canvas);

canvas.layers.main.ctx.fillStyle = 'red'
canvas.layers.main.ctx.fillText(data, 100, 100)