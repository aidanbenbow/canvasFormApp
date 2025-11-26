import { ACTIONS } from "../events/actions.js";
import { normalizeForm } from "../plugins/formManifests.js";
import { CreateForm } from "./createForm.js";


export class EditForm extends CreateForm{
    constructor({ id='editForm', context, dispatcher, eventBusManager, store, onSubmit }) {
        super({ id, context, dispatcher, eventBusManager, store, onSubmit });
        this.manifest = this.store.getActiveForm() 

        this.manifestUI.formContainer.clearChildren();
        this.manifestUI.buildFormFromManifest(this.manifest, this.manifestUI.formContainer, {
            onSubmit: (responseData) => {
                this.handleSubmit(responseData);
            }
        });
        this.context.pipeline.invalidate();
    }
    handleSubmit() {
        const normalizedForm = normalizeForm(this.manifest);
        this.onSubmit?.(normalizedForm);
        this.dispatcher.dispatch(
            ACTIONS.FORM.UPDATE,
            normalizedForm
        );
    }
   
}