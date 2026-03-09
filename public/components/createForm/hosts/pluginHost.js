export class PluginHost {
  constructor() {
    this.plugins = [];
  }

  registerPlugin(plugin) {
    if (!plugin || typeof plugin !== 'object') return;
    if (!plugin.name || typeof plugin.name !== 'string') return;
    if (typeof plugin.transform !== 'function' && typeof plugin.transformFields !== 'function') return;

    const existingIndex = this.plugins.findIndex((entry) => entry?.name === plugin.name);
    if (existingIndex >= 0) {
      this.plugins[existingIndex] = plugin;
      return;
    }

    this.plugins.push(plugin);
  }

  registerPlugins(plugins = []) {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  unregisterPlugin(pluginName) {
    if (!pluginName) return;
    this.plugins = this.plugins.filter((plugin) => plugin?.name !== pluginName);
  }

  clearPlugins() {
    this.plugins = [];
  }

  getRegisteredPlugins() {
    return [...this.plugins];
  }

  getPlugins() {
    return this.getRegisteredPlugins();
  }
}
