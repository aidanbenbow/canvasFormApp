import { UIElement } from "./UiElement.js";
import { BaseScreen } from "./baseScreen.js";
import { createUIComponent } from "./createUIComponent.js";
import { ManifestUI } from "./manifestUI.js";

const formViewManifest = {
    layout: 'vertical',
   forms: {
        idSuffix: 'formContainer',
        type: 'container',
        assignTo: 'formContainer'
    }
};

export class ViewForm extends BaseScreen{
    constructor({id, context, dispatcher, eventBusManager, store,factory,  onSubmit }) {
        super({id, context, dispatcher, eventBusManager });
        this.store = store;
        this.onSubmit = onSubmit;
        this.inputBoxes = new Map();
        this.factory = factory;
        this.buildUI();
        this.rootElement.addChild(this.manifestUI);
        this.buildLayout();
    }
    buildUI() {
        this.manifestUI.buildContainersFromManifest(formViewManifest);
    }
    buildLayout() {
        const activeForm = this.store.getActiveForm();
        this.manifestUI.buildFormFromManifest(activeForm, this.manifestUI.formContainer, {
            onSubmit: this.onSubmit
        });
          // 🔹 Immediately measure and lay out
  const canvas = this.context.uiStage.layoutRenderer.canvas;
  const w = canvas.width;
  const h = canvas.height;
  this.manifestUI.measure({ maxWidth: w, maxHeight: h });
  this.manifestUI.layout(0, 0, w, h);

    }

}

