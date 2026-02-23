import { ACTIONS } from '../events/actions.js';
import { saveFormStructure } from '../controllers/socketController.js';
import { BaseScreen } from './baseScreen.js';
import { FormBuilderEngine } from './createForm/formBuilderEngine.js';
import { getCreateFormDragHandlePresentation } from './createForm/createFormDragHandlePresentation.js';
import { resolveCreateFormFieldIdFromNode } from './createForm/createFormFieldResolver.js';
import { buildDefaultCreateFormField } from './createForm/createFormFieldFactory.js';
import {
  buildCreateDisplayFields,
  buildCreateFormManifest
} from './manifests/createFormManifest.js';
import {
  createCanvasUiRendererAdapter,
  createCommandRegistryAdapter,
  createFormModelAdapter,
  createPersistenceAdapter
} from './createForm/formBuilderAdapters.js';

export class CreateForm extends BaseScreen {
  constructor({ id='createForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, form, persistenceAdapter }) {
    super({ id, context, dispatcher, eventBusManager });

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
          user: normalizedForm.user,
          resultsTable: normalizedForm.resultsTable
        });
      }
    });
    const persistence = persistenceAdapter || defaultPersistence;
    const commands = createCommandRegistryAdapter(commandRegistry);
    const uiRenderer = createCanvasUiRendererAdapter({
      factories,
      commandRegistry,
      context
    });

    this.engine = new FormBuilderEngine({
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
      uiRendererAdapter: uiRenderer,
      manifestBuilder: buildCreateFormManifest,
      displayBuilder: buildCreateDisplayFields,
      fieldFactory: buildDefaultCreateFormField,
      fieldResolver: resolveCreateFormFieldIdFromNode,
      dragHandlePresentation: ({ fieldId, smallScreen, previewInsertionBeforeFieldId }) =>
        getCreateFormDragHandlePresentation({
          fieldId,
          smallScreen,
          previewInsertionBeforeFieldId
        }),
      form
    });

    this.engine.registerCommands();
  }

  createRoot() {
    this.rootNode = this.engine.mount();
    return this.rootNode;
  }

  onExit() {
    this.engine.destroy();
  }
}
