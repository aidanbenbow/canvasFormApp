export class UIStateStore {
    state = {};
    listeners = [];
  
    update(id, partial) {
      this.state[id] = {
        hovered: false,
        focused: false,
        active: false,
        pressed: false,
        ...this.state[id],
        ...partial
      };
     
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