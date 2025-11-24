import { UIElement } from "./UiElement.js";
import { BaseScreen } from "./baseScreen.js";
import { createUIComponent } from "./createUIComponent.js";
import { ManifestUI } from "./manifestUI.js";

const formViewManifest = [
    {
        idSuffix: 'formContainer',
        type: 'container',
        layout: { x: 20, y: 20, width: 600, height: 400 },
        scroll: true,
        assignTo: 'formContainer'
    }
];

export class ViewForm extends BaseScreen{
    constructor({id, context, dispatcher, eventBusManager, store,  onSubmit }) {
        super({id, context, dispatcher, eventBusManager });
        this.store = store;
        this.onSubmit = onSubmit;
        this.inputBoxes = new Map();
        this.manifestUI = new ManifestUI({ id: `${this.id}-manifestUI`, context, layoutManager: this.context.uiStage.layoutManager, layoutRenderer: this.context.uiStage.layoutRenderer });
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
    }

}

