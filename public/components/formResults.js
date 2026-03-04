import { BaseScreen } from './baseScreen.js';
import { FormResultsEngine } from './engines/formResultsEngine.js';

export class UIFormResults extends BaseScreen {
    constructor(deps) {
        super(deps);
        this.engine = new FormResultsEngine(deps);
    }

    createRoot() {
        this.rootNode = this.engine.mount();
        return this.rootNode;
    }

    onExit() {
        this.engine.destroy();
    }
}

