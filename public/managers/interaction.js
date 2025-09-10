
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
        document.addEventListener('click', (e) => {
            const pos = this.getMousePos(this.canvas, e);
            const normPos = this.normalisePos(this.canvas, pos);
            this.hitManager.handleClick(normPos);
        });
    
        document.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(this.canvas, e);
            this.hitManager.handleMouseMove(pos);
        });
    }
}