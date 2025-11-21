export class ActionDispatcher {
    constructor({ context, registry = new Map() }) {
      this.context = context;
      this.registry = registry;
    }
  
    register(actionName, handler) {
      this.registry.set(actionName, handler);
    }
  
    dispatch(actionName, payload) {
      const handler = this.registry.get(actionName);
      if (!handler) {
        console.warn(`No handler registered for action: ${actionName}`);
        return;
      }
      handler(payload, this.context);
    }
  
    unregister(actionName) {
      this.registry.delete(actionName);
    }
  
    clear() {
      this.registry.clear();
    }
  }