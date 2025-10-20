export class UIManager {
    constructor() {
      this.components = [];
    }
  
    add(component) {
      this.components.push(component);
    }
  
    render(ctx) {
      this.components.forEach(c => c.render(ctx));
    }
  
    handleClick(x, y) {
      for (const c of this.components) {
        if (c.contains(x, y)) {
          c.onClick?.();
          break;
        }
      }
    }
  }
  