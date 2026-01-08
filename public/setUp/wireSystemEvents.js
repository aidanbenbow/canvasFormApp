import { CreateForm } from "../components/createForm.js";
import { DashBoardScreen } from "../components/dashBoard.js";
import { EditForm } from "../components/editForm.js";
import { UIFormResults } from "../components/formResults.js";
import { FormViewScreen } from "../components/viewForm.js";

import { onDelete, saveFormStructure, sendLog } from "../controllers/socketController.js";
import { ACTIONS } from "../events/actions.js";

export function wireSystemEvents(system, context, store ={}, router, factories, commandRegistry) {
    const dispatcher = system.actionDispatcher;
    const bus = system.eventBusManager;

    dispatcher.on(ACTIONS.DASHBOARD.SHOW, (forms)=> {
       
        const dash = new DashBoardScreen({ context, dispatcher, eventBusManager: bus, store, factories, commandRegistry  });
        router.replace(dash);
        dispatcher.dispatch(ACTIONS.FORM.SET_LIST,forms)
    },'wiring');

    dispatcher.on(ACTIONS.FORM.VIEW, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
      console.log(`Viewing form with id: ${form.id}`);
        const view = new FormViewScreen({
          context,
          dispatcher,
          eventBusManager: bus,
          store,
          factories,
          onSubmit: (responseData) => {
            dispatcher.dispatch(ACTIONS.FORM.SUBMIT, {
              form: store.getActiveForm(),
              responseData
            });
          }
        });
      
        router.push(view);
      }, 'wiring');

    dispatcher.on(ACTIONS.FORM.RESULTS, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
      const results = store.getFormResults(form.id);
      const resultView = new UIFormResults({ id: 'formResultsScreen', context,
      dispatcher,
      eventBusManager: bus,
        store,
        results
        });      resultView.attachToStage(context.uiStage);
        context.pipeline.invalidate();

    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.CREATE, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

        const creator = new CreateForm({ id: 'createFormScreen', context,dispatcher, eventBusManager: bus,store,
        onSubmit: (updatedForm) => {
            dispatcher.dispatch(ACTIONS.FORM.ADD, updatedForm);
            saveFormStructure({
                id: updatedForm.id,
                formStructure: updatedForm.formStructure,
                label: updatedForm.label,
                user: updatedForm.user,
              });
              context.overlayManager.showSuccess(`Form ${updatedForm.label} created successfully!`);
        } });
        creator.attachToStage(context.uiStage);
        context.pipeline.invalidate();
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.EDIT, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

        const editor = new EditForm({ id: 'editFormScreen', context, dispatcher, eventBusManager: bus, store,
        onSubmit: (updatedForm) => {
            dispatcher.dispatch(ACTIONS.FORM.UPDATE, updatedForm);
            saveFormStructure({
                id: updatedForm.id,
                formStructure: updatedForm.formStructure,
                label: updatedForm.label,
                user: updatedForm.user,
            });
        } });
        editor.attachToStage(context.uiStage);
        context.pipeline.invalidate();
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.SUBMIT, async ({ form, responseData}) => {
            sendLog(`Form ${form.id} submitted with data: ${JSON.stringify(responseData)}`, responseData);
        context.overlayManager.showSuccess(`Form ${form.label} submitted successfully!`);
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.DELETE, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
        // Here you might want to add confirmation dialog before deletion
   console.log(`Deleting form with id: ${form.id}`);
        onDelete({id: form.id});
        //store.removeForm(form.id);
        context.pipeline.invalidate();
    }, 'wiring');

 
}