export class AssetRegistry {
    constructor() {
      this.assets = new Map(); // key → asset (URL, Image object, etc.)
    }
  
    register(key, asset) {
      this.assets.set(key, asset);
    }
  
    get(key) {
      return this.assets.get(key);
    }
  
    has(key) {
      return this.assets.has(key);
    }
  }