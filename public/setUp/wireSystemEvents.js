import { UIFormResults } from "../components/formResults.js";
import { ViewForm } from "../components/viewForm.js";
import { ACTIONS } from "../events/actions.js";

export function wireSystemEvents(system, context, store ={}) {
    const dispatcher = system.actionDispatcher;
    const bus = system.eventBusManager;

    dispatcher.on(ACTIONS.DASHBOARD.SHOW, (forms)=> {
        dispatcher.dispatch(ACTIONS.FORM.SET_LIST,forms)
    },'wiring');

    dispatcher.on(ACTIONS.FORM.VIEW, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

        const view = new ViewForm({ id: 'viewFormScreen', context, 
    layoutManager: context.uiStage.layoutManager,
    layoutRenderer: context.uiStage.layoutRenderer,
    store,
    onSubmit: (responseData) => {
        dispatcher.dispatch(ACTIONS.FORM.SUBMIT, { form: store.getActiveForm(), responseData });}
    });
        view.attachToStage(context.uiStage);
        context.pipeline.invalidate();
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.RESULTS, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
      const results = store.getFormResults(form.id);
      const resultView = new UIFormResults({ id: 'formResultsScreen', context,
      dispatcher,
      eventBusManager: bus,
        form,
        results
        });      resultView.attachToStage(context.uiStage);
        context.pipeline.invalidate();

    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.EDIT, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

        // Placeholder for EditFormScreen
        console.log("EditFormScreen is not implemented yet.");
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.SUBMIT, async ({ form, responseData, onSubmit }) => {
        console.log("Form submitted:", form, responseData);
        if (typeof onSubmit === 'function') {
            onSubmit(responseData);
        }
    }, 'wiring');
}