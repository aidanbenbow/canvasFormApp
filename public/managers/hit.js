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
    getHitTarget(pos) {
      if (!this.getHitHex) return null;
      const hex = this.getHitHex(this.hitCtx, pos);
      return this.hitRegistry.get(hex);
    }
    
    
    handleClick(canvas,pos) {
      
      const hex = this.getHitHex(canvas,this.hitCtx, pos);
      const hitObject = this.hitRegistry.get(hex);
     
    
      if (hitObject) {
        this.eventBus.emit('hitClick', {hex,hitObject});
   
    }}
    handleMouseMove(canvas,pos) {
      const hex = this.getHitHex(canvas,this.hitCtx,pos);
      const hitObject = this.hitRegistry.get(hex);
       
    }
  }