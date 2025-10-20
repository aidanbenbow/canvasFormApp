export class UIRegistry {
    constructor() {
      this.components = new Map(); // id → component
    }
  
    register(id, component) {
      this.components.set(id, component);
    }
  
    unregister(id) {
      this.components.delete(id);
    }
  
    get(id) {
      return this.components.get(id);
    }
  
    render(ctx) {
      for (const component of this.components.values()) {
        component.render?.(ctx);
      }
    }
  
    handleClick(x, y) {
      for (const [id, component] of this.components.entries()) {
        if (component.contains?.(x, y)) {
          component.onClick?.(x, y);
          return id;
        }
      }
      return null;
    }
  
    getAll() {
      return Array.from(this.components.values());
    }
  }
  