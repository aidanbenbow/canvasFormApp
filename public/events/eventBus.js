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
      const handlers = this.listeners.get(event)||[];
        this.listeners.set(event, handlers.filter(h => h !== handler)); 
    }
  
    emit(event, payload) {
      const handlers = this.listeners.get(event);
      if(!handlers || handlers.length === 0){
          console.warn(`No handlers for event: ${event}`);
          return;
      }
      handlers.slice().forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in handler for event: ${event}`, error);
        }
      });
    }
  
    clear() {
      this.listeners.clear();
    }
  }