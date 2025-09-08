import { utilsRegister } from "../utils/register.js";

export class HitManager {
    constructor( hitRegistry, hitCtx, eventBus, actionRegistry) {
      this.getHitHex = utilsRegister.get('hit', 'getHitHex');
      this.hitRegistry = hitRegistry;
        this.hitCtx = hitCtx;
        this.eventBus = eventBus;
        this.actionRegistry = actionRegistry;
    }
  
    getHoverInfo(pos) {
      const hex = this.getHitHex(this.hitCtx, pos);
      return this.hitRegistry.get(hex);
    }
    handleClick(pos) {
      const hex = this.getHitHex(this.hitCtx, pos);
      const hitObject = this.hitRegistry.get(hex);
      console.log(this.hitRegistry);
     console.log('HitManager handleClick:', { pos, hex, hitObject });
    
      if (hitObject) {
       // this.eventBus.emit('hitClick', hitObject);
    
        const actionKey = hitObject.metadata?.actionKey;
        const directAction = hitObject.metadata?.action
    
        if (actionKey) {
          const actionFn = this.actionRegistry?.get(actionKey);
          if (typeof actionFn === 'function') {
            actionFn(hitObject.box);
            this.eventBus.emit('actionTriggered', {
              box: hitObject.box,
              region: hitObject.region,
              actionKey
            });
          } else {
            console.warn(`No action registered for key: ${actionKey}`);
          } }else if(typeof directAction === 'function') {
            directAction(hitObject.box);
            this.eventBus.emit('actionTriggered', {
              box: hitObject.box,
              region: hitObject.region,
              action: 'direct'
            });
        }
      }
    }
    handleMouseMove(pos) {
      const hex = this.getHitHex(this.hitCtx,pos);
      const hitObject = this.hitRegistry.get(hex);
       
    }
  }