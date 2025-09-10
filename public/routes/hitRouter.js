export class HitRouter {
    constructor(hitRegistry, modeState) {
      this.hitRegistry = hitRegistry;
      this.modeState = modeState;
      this.handlers = new Map(); // type -> handler
    }
  
    registerHandler(type, handlerFn) {
      this.handlers.set(type, handlerFn);
    }
  
    routeHit(hex) {
      const hitInfo = this.hitRegistry.get(hex);
      if (!hitInfo) return;
  
      const { type, box, region, metadata } = hitInfo;
  
      if (this.modeState.current === 'fill' && type === 'loginButton') {
        const handler = this.handlers.get(type);
        if (handler) handler(hitInfo);
      }
  
      if (this.modeState.current === 'admin' && type === 'formBox') {
        const handler = this.handlers.get(type);
        if (handler) handler(hitInfo);
      }
    }
  }