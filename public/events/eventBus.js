export class EventBus {
    constructor() {
      this.listeners = new Map();
    }
  
    on(event, handler) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(handler);
    }
  
    off(event, handler) {
      const handlers = this.listeners.get(event);
      if (handlers) {
        this.listeners.set(event, handlers.filter(h => h !== handler));
      }
    }
  
    emit(event, payload) {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.forEach(handler => handler(payload));
      }
    }
  
    clear() {
      this.listeners.clear();
    }
  }