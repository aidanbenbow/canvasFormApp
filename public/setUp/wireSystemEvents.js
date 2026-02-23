import { articleViewScreen } from "../components/articleView.js";
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
    const toastLayer = context.uiServices?.toastLayer;

    const showToast = (text) => {
      if (!toastLayer) return;
      const node = factories.basic.create({
        type: 'text',
        text,
        id: `toast-${Date.now()}`,
        style: {
          font: "30px sans-serif",
          color: "#ffffff",
          backgroundColor: "#0b8f3a",
          borderColor: "#06702c",
          paddingX: 22,
          paddingY: 14,
          radius: 10,
          align: "center",
          shrinkToFit: true
        }
      });
      toastLayer.showMessage(node, { timeoutMs: 2500 });
    };

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
        commandRegistry,
        formId: form.id,
        onSubmit: (responseData) => {
          dispatcher.dispatch(ACTIONS.FORM.SUBMIT, {
            form: store.getActiveForm(),
            responseData
          })
        },
        results: store.getFormResults(form.id)
      });
  
      router.push(view);
    }, "wiring");
  
    dispatcher.on(ACTIONS.ARTICLE.VIEW, async (article) => {
      console.log(`Viewing article with id: ${article.userId}`);
      // Implement article viewing logic here
      const view = new articleViewScreen({
        context,
        dispatcher,
        eventBusManager: bus,
        store,
        factories,
        commandRegistry,
        article
      });
      router.push(view);

    }
    , "wiring");

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

      const creator = new CreateForm({ id: 'createFormScreen', context, dispatcher, eventBusManager: bus, store, factories, commandRegistry,
        onSubmit: (updatedForm) => {
            dispatcher.dispatch(ACTIONS.FORM.ADD, updatedForm);
            saveFormStructure({
                id: updatedForm.id,
                formStructure: updatedForm.formStructure,
                label: updatedForm.label,
                user: updatedForm.user,
                resultsTable: updatedForm.resultsTable,
              });
              showToast(`Form ${updatedForm.label} created successfully!`);
        } });
      router.push(creator);
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.EDIT, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

      const editor = new EditForm({ id: 'editFormScreen', context, dispatcher, eventBusManager: bus, store, factories, commandRegistry,
        onSubmit: (updatedForm) => {
            dispatcher.dispatch(ACTIONS.FORM.UPDATE, updatedForm);
            saveFormStructure({
                id: updatedForm.id,
                formStructure: updatedForm.formStructure,
                label: updatedForm.label,
                user: updatedForm.user,
              resultsTable: updatedForm.resultsTable,
            });
        } });
      router.push(editor);
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.SUBMIT, async ({ form, responseData}) => {
        sendLog(`Form ${form.id} submitted with data: ${JSON.stringify(responseData)}`, responseData);
        showToast(`Form ${form.label} submitted successfully!`);
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