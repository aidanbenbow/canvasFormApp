export class UtilitiesRegistry {
    constructor() {
      this.namespaces = {};
      this.hooks = {
        onRegister: [],
        onOverride: [],
        onDispose: []
      };
    }
  
    register(namespace, name, fn) {
      if (!this.namespaces[namespace]) {
        this.namespaces[namespace] = {};
      }
  
      const isOverride = !!this.namespaces[namespace][name];
      this.namespaces[namespace][name] = fn;
  
      const hookType = isOverride ? 'onOverride' : 'onRegister';
      this.hooks[hookType].forEach(hook => hook(namespace, name, fn));
    }
    registerPlugin(plugin) {
        if (typeof plugin.registerUtilities === 'function') {
          plugin.registerUtilities(this);
        }
      }
  
    get(namespace, name) {
      return this.namespaces[namespace]?.[name] || null;
    }
  
    dispose(namespace, name) {
      if (this.namespaces[namespace]?.[name]) {
        this.hooks.onDispose.forEach(hook => hook(namespace, name));
        delete this.namespaces[namespace][name];
      }
    }
  
    on(hookType, fn) {
      if (this.hooks[hookType]) {
        this.hooks[hookType].push(fn);
      }
    }
  
    getNamespace(namespace) {
      return this.namespaces[namespace] || {};
    }
    listNamespaces() {
      return Object.keys(this.namespaces);
    }
    }