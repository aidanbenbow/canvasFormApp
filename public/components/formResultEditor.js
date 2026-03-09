import { BaseScreen } from './baseScreen.js';
import { FormResultEditorEngine } from './engines/formResultEditorEngine.js';

export class FormResultEditorScreen extends BaseScreen {
  constructor(deps) {
    super(deps);
    this.engine = new FormResultEditorEngine(deps);
  }

  createRoot() {
    this.rootNode = this.engine.mount();
    return this.rootNode;
  }

  onExit() {
    this.engine.destroy();
  }
}
