export class CommandRegistry {
    constructor() {
      this.commands = new Map();
      this.middleware = [];
    }
  
    use(fn) {
      this.middleware.push(fn);
    }
  
    register(name, handler, meta = {}) {
      this.commands.set(name, { handler, meta });
    }

    unregister(name) {
      if (!name) return;
      this.commands.delete(name);
    }

    unregisterMany(names = []) {
      if (!Array.isArray(names)) return;
      for (const name of names) {
        this.unregister(name);
      }
    }
  
    async execute(name, payload) {
      const entry = this.commands.get(name);
      if (!entry) {
        console.warn(`Command not found: ${name}`);
        return;
      }
  
      let context = { name, payload, meta: entry.meta };
  
      // Run middleware chain
      for (const mw of this.middleware) {
        context = await mw(context) || context;
      }
  
      return entry.handler(context.payload);
    }
  }