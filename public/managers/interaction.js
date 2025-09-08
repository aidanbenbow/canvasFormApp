
import { utilsRegister } from "../utils/register.js";

export class interactionManager{
    constructor(canvasManager, hitManager){
        this.canvas = canvasManager.layers.main.canvas;
        this.hitManager = hitManager;
        this.getMousePos = utilsRegister.get('mouse', 'getMousePosition');
        this.normalisePos = utilsRegister.get('normalise', 'normalizePos');
        
        this.attachListeners();
    }

    attachListeners(){
        this.canvas.addEventListener('click', (e) => {
            const pos = this.getMousePos(this.canvas, e);
            const normPos = this.normalisePos(this.canvas, pos);
            this.hitManager.handleClick(normPos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(this.canvas, e);
           
            this.hitManager.handleMouseMove(pos);
        });
    }
}