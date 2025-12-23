export const StrategyRegistry = {
    layout: new Map(),
    render: new Map(),
    update: new Map(),
    hitTest: new Map(),
  
    register(type, name, strategy) {
      this[type].set(name, strategy);
    },
  
    get(type, name) {
      return this[type].get(name) ?? null;
    }
  };