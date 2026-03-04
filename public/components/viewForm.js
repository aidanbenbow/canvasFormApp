import { BaseScreen } from "./baseScreen.js";
import { ViewFormEngine } from "./engines/viewFormEngine.js";


export class FormViewScreen extends BaseScreen {
  constructor(deps) {
    super({ id: "form-view", ...deps });
    this.engine = new ViewFormEngine({ id: this.id, ...deps });
  }

  createRoot() {
    this.rootNode = this.engine.mount();
    return this.rootNode;
  }

  onExit() {
    this.engine.destroy();
  }
}
