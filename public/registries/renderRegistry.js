
export class RendererRegistry {
    constructor() {
      this.renderers = new Map(); // key: type, value: renderer instance
      this.hooks = {
        onRegister: [],
        onOverride: []
      };
    }
  
    on(hookType, fn) {
      if (this.hooks[hookType]) {
        this.hooks[hookType].push(fn);
      }
    }
  
    register(type, renderer) {
      const isOverride = this.renderers.has(type);
      this.renderers.set(type, renderer);
  
      const hookType = isOverride ? 'onOverride' : 'onRegister';
      this.hooks[hookType].forEach(hook => hook(type, renderer));
    }
  
    get(type) {
      return this.renderers.get(type);
    }
  
    getAll() {
      return Array.from(this.renderers.values());
    }
  }