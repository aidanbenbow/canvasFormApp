import { attachModules, detachModules } from './moduleLifecycle.js';

export class BaseEngine {
  constructor({ id, context } = {}) {
    this.id = id;
    this.context = context;
    this.modules = [];
    this.lifecycleModules = [];
    this.isMounted = false;
  }

  mount() {
    this.attachModules(this.lifecycleModules);
    this.isMounted = true;
  }

  attachModules(modules = this.modules) {
    attachModules(modules);
  }

  detachModules(modules = this.modules) {
    detachModules(modules);
  }

  destroy() {
    this.detachModules(this.modules);
    this.isMounted = false;
  }
}