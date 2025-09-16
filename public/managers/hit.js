import { utilsRegister } from "../utils/register.js";

export class HitManager {
    constructor( hitRegistry, hitCtx, eventBus, actionRegistry) {
      this.getHitHex = null
      this.hitRegistry = hitRegistry;
        this.hitCtx = hitCtx;
        this.eventBus = eventBus;
        this.actionRegistry = actionRegistry;
    }
    setHitHexFunction(func){
      this.getHitHex = func;
    }
  
    getHoverInfo(pos) {
      const hex = this.getHitHex(this.hitCtx, pos);
      return this.hitRegistry.get(hex);
    }
    handleClick(pos) {
      
      const hex = this.getHitHex(this.hitCtx, pos);
      const hitObject = this.hitRegistry.get(hex);
     
    
      if (hitObject) {
        this.eventBus.emit('hitClick', {hex,hitObject});
   
    }}
    handleMouseMove(pos) {
      const hex = this.getHitHex(this.hitCtx,pos);
      const hitObject = this.hitRegistry.get(hex);
       
    }
  }