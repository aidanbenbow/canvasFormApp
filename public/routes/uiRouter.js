export class UIRouter {
    constructor(uiRegistry) {
      this.uiRegistry = uiRegistry;
      this.routeOrder = []; // Optional: prioritize routing by component ID or type
    }
  
    routeClick(x, y) {
      for (const id of this.routeOrder.length ? this.routeOrder : this.uiRegistry.components.keys()) {
        const component = this.uiRegistry.get(id);
        if (component?.contains?.(x, y)) {
          component.onClick?.(x, y);
          return id;
        }
      }
      return null;
    }
  
    setRouteOrder(ids) {
      this.routeOrder = ids;
    }
  }
  