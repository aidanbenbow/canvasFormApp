class ScreenRegistry {
  constructor() {
    this.map = {};
  }

  register(name, screenClass) {
    this.map[name] = screenClass;
  }

  get(name) {
    return this.map[name];
  }
}

export const screenRegistry = new ScreenRegistry();