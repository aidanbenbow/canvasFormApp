export class UIStateStore {
    state = {};
    listeners = [];
  
    update(id, partial) {
      const prev = this.state[id] || {};
      this.state[id] = { ...prev, ...partial };
      
      this.notify();
    }
    
  
    get(id) {
      return this.state[id] ?? {};
    }
  
    subscribe(fn) {
      this.listeners.push(fn);
    }
  
    notify() {
      for (const l of this.listeners) l(this.state);
    }
  }