import { canvasConfig } from "./constants.js";
import { CanvasManager } from "./managers/canvas.js";


const canvas = new CanvasManager(canvasConfig)

console.log(canvas);