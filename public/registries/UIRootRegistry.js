export class UIRootRegistry {
    constructor() {
      this.roots = [];
    }
  
    add(root) {
      this.roots.push(root);
    }
  
    remove(root) {
      this.roots = this.roots.filter(r => r !== root);
    }
  
    dispatchEvent(event) {
      for (const root of this.roots) {
        if (root.dispatchEvent(event)) return true;
      }
      return false;
    }
  
    render(ctx) {
      for (const root of this.roots) {
        root.render(ctx);
      }
    }
  }
  