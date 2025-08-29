import { utilsRegister } from "../utils/register.js";

export class HitManager {
    constructor( hitRegistry, hitCtx, eventBus) {
      this.getHitHex = utilsRegister.get('hit', 'getHitHex');
      this.hitRegistry = hitRegistry;
        this.hitCtx = hitCtx;
        this.eventBus = eventBus;
    }
  
    getHoverInfo(pos) {
      const hex = this.getHitHex(this.hitCtx, pos);
      return this.hitRegistry.get(hex);
    }
    handleClick(pos) {
      const hex = this.getHitHex(this.hitCtx,pos);
      const hitObject = this.hitRegistry.get(hex);
        if(hitObject){
            this.eventBus.emit('hitClick', hitObject);
        }
    }
    handleMouseMove(pos) {
      const hex = this.getHitHex(this.hitCtx,pos);
      const hitObject = this.hitRegistry.get(hex);
       
    }
  }