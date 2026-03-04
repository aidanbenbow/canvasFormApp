import { BaseEngine } from './baseEngine.js';

export class BaseScreenEngine extends BaseEngine {
  constructor({ id, context } = {}) {
    super({ id, context });
    this.rootNode = null;
    this.regions = null;
  }

  mount() {
    super.mount();
    return this.rootNode;
  }
}