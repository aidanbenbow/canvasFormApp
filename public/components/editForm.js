import { ACTIONS } from "../events/actions.js";
import { CreateForm } from "./createForm.js";
import { createPersistenceAdapter } from "./createForm/formBuilderAdapters.js";


export class EditForm extends CreateForm{
    constructor({ id='editForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit }) {
        const persistence = createPersistenceAdapter({
            onSave: (normalizedForm) => {
                onSubmit?.(normalizedForm);
                dispatcher.dispatch(
                    ACTIONS.FORM.UPDATE,
                    normalizedForm
                );
            }
        });

        super({
            id,
            context,
            dispatcher,
            eventBusManager,
            store,
            factories,
            commandRegistry,
            onSubmit,
            form: store.getActiveForm(),
            persistenceAdapter: persistence
        });
    }
   
}