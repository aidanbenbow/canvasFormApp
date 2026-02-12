import { ACTIONS } from "../events/actions.js";
import { normalizeForm } from "../plugins/formManifests.js";
import { CreateForm } from "./createForm.js";


export class EditForm extends CreateForm{
    constructor({ id='editForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit }) {
        super({ id, context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, form: store.getActiveForm() });
    }
    handleSubmit() {
        const normalizedForm = normalizeForm(this.form);
        this.onSubmit?.(normalizedForm);
        this.dispatcher.dispatch(
            ACTIONS.FORM.UPDATE,
            normalizedForm
        );
    }
   
}