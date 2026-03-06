import { ACTIONS } from "../events/actions.js";
import { CreateForm } from "./createForm.js";
import { createPersistenceAdapter } from "./createForm/formBuilderAdapters.js";
import { formRepository } from "../repositories/formRepository.js";


export class EditForm extends CreateForm{
    constructor({ id='editForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit }) {
        const persistence = createPersistenceAdapter({
            onSave: async (normalizedForm) => {
                const formId = normalizedForm?.formId || normalizedForm?.id;
                if (!formId) return;

                await formRepository.updateForm(formId, {
                    formStructure: normalizedForm.formStructure,
                    label: normalizedForm.label,
                    user: normalizedForm.user,
                    resultsTable: normalizedForm.resultsTable
                });

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