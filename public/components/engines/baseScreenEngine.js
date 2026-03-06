import { BaseEngine } from './baseEngine.js';

export class BaseScreenEngine extends BaseEngine {
  constructor({ id, context, onEngineEvent } = {}) {
    super({ id, context, onEngineEvent });
    this.rootNode = null;
    this.regions = null;
  }

  mount() {
    super.mount();
    return this.rootNode;
  }
}