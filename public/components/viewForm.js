import { UIElement } from "./UiElement.js";
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

export class ViewForm extends ManifestUI{
    constructor({ id, context, layoutManager, layoutRenderer, form, onSubmit }) {
        super({ id, context, layoutManager, layoutRenderer });
        this.form = typeof form === 'string' ? JSON.parse(form) : form;
        console.log('ViewForm initialized with form:', this.form);
        this.inputBoxes = new Map();
        this.onSubmit = onSubmit;
        this.responseData = {};
        this.buildUI();
        this.buildForm();
    }
    buildUI() {
        this.buildContainersFromManifest(formViewManifest);
    }
    buildForm() {
         this.buildFormFromManifest(this.form, this.formContainer, { onSubmit: this.onSubmit });
    }
}

