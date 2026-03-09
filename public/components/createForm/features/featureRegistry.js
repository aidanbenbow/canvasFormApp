export class FeatureRegistry {
  constructor() {
    this.features = [];
  }

  register(feature) {
    if (!feature || typeof feature !== 'object') return;

    if (typeof feature.attach !== 'function') {
      feature.attach = () => {};
    }

    if (typeof feature.detach !== 'function') {
      feature.detach = () => {};
    }

    if (typeof feature.onRender !== 'function') {
      feature.onRender = () => false;
    }

    if (typeof feature.onRuntime !== 'function') {
      feature.onRuntime = () => false;
    }

    this.features.push(feature);
  }

  unregister(feature) {
    if (!feature) return;
    this.features = this.features.filter((entry) => entry !== feature);
  }

  clear() {
    this.features = [];
  }

  getFeatures() {
    return [...this.features];
  }

  getRenderFeatures() {
    return this.features.filter((feature) => feature.onRender?.() === true);
  }

  getRuntimeFeatures() {
    return this.features.filter((feature) => feature.onRuntime?.() === true);
  }

  runRenderHooks(context) {
    for (const feature of this.getRenderFeatures()) {
      feature.onRender?.(context);
    }
  }

  runRuntimeHooks(context) {
    for (const feature of this.getRuntimeFeatures()) {
      feature.onRuntime?.(context);
    }
  }
}
