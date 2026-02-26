import { formResultsRepository } from "../../repositories/formResultsRepository.js";

export function registerFormCommands(commandRegistry, context, store, showToast) {
  commandRegistry.register("form.submit", (payload) => {
    const activeForm = store.getActiveForm();
    if (!activeForm) return;

    const submission = {
      formId: activeForm.formId,
      userId: localStorage.getItem("username") || "admin",
      payload: payload.fields || {}
    };

    formResultsRepository.saveResult(submission);

    showToast("Form submitted", 3000);

    context.dispatcher.dispatch(ACTIONS.KEYBOARD.HIDE);
    context.dispatcher.dispatch(ACTIONS.POPUP.HIDE);
    context.dispatcher.dispatch(ACTIONS.DROPDOWN.HIDE);
    context.pipeline.invalidate();
  });
}