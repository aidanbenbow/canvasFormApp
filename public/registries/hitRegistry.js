export class HitRegistry {
    constructor() {
      this.registry = new Map(); // hex -> { box, region, metadata }
    }
  
    register(hex, info) {
      this.registry.set(hex/*.toLowerCase()*/, info);
     
    }
  
    unregister(hex) {
      this.registry.delete(hex.toLowerCase());
    }
  
    get(hex) {
      return this.registry.get(hex) || null;
    }
  
    clear() {
      this.registry.clear();
    }
    entries() {
      return this.registry.entries();
    }
    has(hex) {
      return this.registry.has(hex.toLowerCase());
    }
get size() {
      return this.registry.size;
}
keys() {
  return this.registry.keys();
}

values() {
  return this.registry.values();
}

    
  }