export class HitRegistry {
    constructor() {
      this.registry = new Map(); // hex -> { box, region, metadata }
    }
  
    register(hex, info) {
      this.registry.set(hex.toLowerCase(), info);
     
    }
  
    unregister(hex) {
      this.registry.delete(hex.toLowerCase());
    }
  
    get(hex) {
      return this.registry.get(hex.toLowerCase()) || null;
    }
  
    clear() {
      this.registry.clear();
    }
  }