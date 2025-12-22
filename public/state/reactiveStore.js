export class ReactiveStore {
    constructor(initialState = {}) {
      this.state = this._normalizeState(initialState);
      this.listeners = new Map();
    }
  
    // 🔹 Normalize state shape for known keys
    _normalizeState(state) {
      const normalized = { ...state };
  
      // Ensure 'forms' is always an object with an array
      if
  (Array.isArray(normalized.forms)) {
        normalized.forms = { forms: normalized.forms };
      } else if (!normalized.forms) {
        normalized.forms = { forms: [] };
      }
  
      // Ensure 'activeForm' exists
      if (!normalized.activeForm) {
        normalized.activeForm = null;
      }
  
      return normalized;
    }
  
    get(key) {
      return this.state[key];
    }
  
    set(key, value) {
      // 🔹 Enforce consistent shape for special keys
      if (key === 'forms') {
        this.state[key] = { forms: Array.isArray(value) ? value : [] };
      } else if (key === 'activeForm') {
        this.state[key] = value || null
   } else {
        this.state[key] = value;
      }
  
      // 🔹 Notify listeners
      if (this.listeners.has(key)) {
        for (const fn of this.listeners.get(key)) {
          fn(this.state[key]);
        }
      }
    }
  
    subscribe(key, fn) {
      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set());
      }
  
      this.listeners.get(key).add(fn);
  
      // 🔹 Immediately emit normalized value
      fn(this.state[key]);
  
      // 🔹 Return unsubscribe
      return () => this.listeners.get(key)?.delete(fn);
    }
  }

  export function bindList({
    store,
    key,
    container,
    factory,
    mapItem
  }) {
    return store.subscribe(key, value => {
      // ✅ With normalized shape, value is always an object
      // For 'forms', value = { forms: [...] }
      const items = Array.isArray(value.forms) ? value.forms : [];
  
      container.setChildren(
        items.map(item => mapItem(item, factory))
      );
    });
  }