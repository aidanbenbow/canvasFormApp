import { ACTIONS } from "../../events/actions.js";
import { formRepository } from "../../repositories/formRepository.js";
import { formResultsRepository } from "../../repositories/formResultsRepository.js";


export function registerFormCommands(commandRegistry, context, store, formService, showToast) {
  console.log("registerFormCommands store =", store);
  const resolveActiveForm = (payload = {}) => {
    const activeForm =
      payload.form ||
      (payload.formId ? store.getState?.().forms?.[payload.formId] : null) ||
      store.getActiveForm?.() ||
      null;

    return activeForm;
  };

  commandRegistry.register("form.view", (payload = {}) => {
    const activeForm = resolveActiveForm(payload);
    if (!activeForm) return;
    context.dispatcher.dispatch(ACTIONS.FORM.VIEW, activeForm, "commands");
  });

  commandRegistry.register("form.results", (payload = {}) => {
    const activeForm = resolveActiveForm(payload);
    if (!activeForm) return;
    context.dispatcher.dispatch(ACTIONS.FORM.RESULTS, activeForm, "commands");
  });

  commandRegistry.register("form.create", () => {
    context.dispatcher.dispatch(ACTIONS.FORM.CREATE, null, "commands");
  });

  commandRegistry.register("form.edit", (payload = {}) => {
    const activeForm = resolveActiveForm(payload);
    if (!activeForm) return;
    context.dispatcher.dispatch(ACTIONS.FORM.EDIT, activeForm, "commands");
  });

  commandRegistry.register("form.delete", async (payload = {}) => {
    const activeForm = resolveActiveForm(payload);
    if (!activeForm) return;

    const formId = activeForm.formId || activeForm.id;
    if (!formId) return;

    await formRepository.deleteForm(formId);
    formService.removeForm(formId);
    showToast?.("Form deleted", 2500);
    context.pipeline.invalidate();
  });

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

  commandRegistry.register("form.update", async (payload) => {
    const activeForm = resolveActiveForm(payload);
    if (!activeForm) return;

    const formId = activeForm.formId || activeForm.id;
    if (!formId) return;
    await formRepository.updateForm(formId, payload.fields);
    formService.updateForm(formId, payload.fields);
    showToast?.("Form updated", 2500);
    context.pipeline.invalidate();
  });

}