import { ACTIONS } from '../events/actions.js';
import { saveFormStructure } from '../controllers/socketController.js';
import { FormBuilderEngine } from './createForm/formBuilderEngine.js';
import {
  createCommandRegistryAdapter,
  createFormModelAdapter,
  createPersistenceAdapter,
  createUiAdapter
} from './createForm/formBuilderAdapters.js';

export class CreateForm extends FormBuilderEngine {
  constructor({ id='createForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, form, persistenceAdapter }) {
    const model = createFormModelAdapter(form);
    const defaultPersistence = createPersistenceAdapter({
      onSave: (normalizedForm) => {
        onSubmit?.(normalizedForm);
        dispatcher.dispatch(ACTIONS.FORM.ADD, normalizedForm);
      },
      onUpdate: (normalizedForm) => {
        dispatcher.dispatch(ACTIONS.FORM.UPDATE, normalizedForm);
        saveFormStructure({
          id: normalizedForm.id,
          formStructure: normalizedForm.formStructure,
          label: normalizedForm.label,
          user: normalizedForm.user
        });
      }
    });
    const persistence = persistenceAdapter || defaultPersistence;
    const commands = createCommandRegistryAdapter(commandRegistry);
    const ui = createUiAdapter(factories);

    super({
      id,
      context,
      dispatcher,
      eventBusManager,
      store,
      factories,
      commandRegistry,
      onSubmit,
      modelAdapter: model,
      persistenceAdapter: persistence,
      commandAdapter: commands,
      uiAdapter: ui,
      form
    });

    this.registerCommands();
  }
}
