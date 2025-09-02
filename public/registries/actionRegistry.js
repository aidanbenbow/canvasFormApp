export class ActionRegistry {
    constructor() {
      this.actions = new Map();
    }
  
    register(key, fn) {
      if (typeof fn !== 'function') {
        throw new Error(`Action "${key}" must be a function`);
      }
      this.actions.set(key, fn);
    }
  
    unregister(key) {
      this.actions.delete(key);
    }
  
    get(key) {
      return this.actions.get(key);
    }
  
    trigger(key, ...args) {
      const action = this.get(key);
      if (action) {
        return action(...args);
      } else {
        console.warn(`No action registered for key: ${key}`);
      }
    }
  
    list() {
      return Array.from(this.actions.keys());
    }
  }