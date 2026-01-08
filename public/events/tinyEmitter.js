export class TinyEmitter {
    constructor() {
      this.listeners = {};
    }
  
    on(event, handler) {
      if (!this.listeners[event]) {
        this.listeners[event] = new Set();
      }
      this.listeners[event].add(handler);
    }
  
    off(event, handler) {
      this.listeners[event]?.delete(handler);
    }
  
    emit(event, payload) {
      const handlers = this.listeners[event];
      if (!handlers) return;
      for (const handler of handlers) {
        handler(payload);
      }
    }
  }