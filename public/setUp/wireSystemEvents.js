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

        const view = new ViewForm({ context, dispatcher, eventBusManager: bus, store, form });
        view.attachToStage(context.uiStage);
    }, 'wiring');

    dispatcher.on(ACTIONS.FORM.RESULTS, async (form) => {
        dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

        // Placeholder for ResultsFormScreen
        console.log("ResultsFormScreen is not implemented yet.");
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