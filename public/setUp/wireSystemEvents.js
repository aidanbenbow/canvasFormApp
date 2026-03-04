import { ACTIONS } from "../events/actions.js";
import { ROUTES } from "../routes/routeNames.js";

import { formService } from "../services/formservice.js";

export function wireSystemEvents(system, context, router, factories, commandRegistry) {
  const dispatcher = system.actionDispatcher;
  const bus = system.eventBusManager;
  const storeRef = context.store;

  const toastLayer = context.uiServices?.toastLayer;

  const showToast = (text) => {
    if (!toastLayer) return;
    const node = factories.basic.create({
      type: "text",
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

  // DASHBOARD
  dispatcher.on(ACTIONS.DASHBOARD.SHOW, (forms) => {
    if (context?.textEditorController?.activeNode) {
      context.textEditorController.stopEditing();
    }

    formService.setForms(forms);
    router.replace(ROUTES.dashboard);
  }, "wiring");

  // VIEW FORM
  dispatcher.on(ACTIONS.FORM.VIEW, (form) => {
    formService.setActiveForm(form.formId);
    router.push(ROUTES.formView, {
      formId: form.formId,
      results: storeRef.getFormResults(form.formId)
    });
  }, "wiring");

  // ACTIVE FORM
  dispatcher.on(ACTIONS.FORM.SET_ACTIVE, (form) => {
    const formId = form?.formId || form?.id;
    if (!formId) return;
    formService.setActiveForm(formId);
  }, "wiring");

  // VIEW ARTICLE
  dispatcher.on(ACTIONS.ARTICLE.VIEW, (article) => {
    router.push(ROUTES.articleView, { article });
  }, "wiring");

  // EDIT ARTICLE
  dispatcher.on(ACTIONS.ARTICLE.EDIT, (article) => {
    router.push(ROUTES.articleEdit, {
      article,
      mode: "edit"
    });
  }, "wiring");

  // FORM RESULTS
  dispatcher.on(ACTIONS.FORM.RESULTS, (form) => {
    formService.setActiveForm(form.formId);

    const results = storeRef.getFormResults(form.formId);
    router.push(ROUTES.formResults, {
      id: "formResultsScreen",
      router,
      results
    });
  }, "wiring");

  // CREATE FORM
  dispatcher.on(ACTIONS.FORM.CREATE, () => {
    router.push(ROUTES.formCreate, {
      id: "createFormScreen"
    });
  }, "wiring");

  // EDIT FORM
  dispatcher.on(ACTIONS.FORM.EDIT, (form) => {
    formService.setActiveForm(form.formId);
    router.push(ROUTES.formEdit, {
      id: "editFormScreen",
      formId: form.formId
    });
  }, "wiring");

  // DELETE FORM
  dispatcher.on(ACTIONS.FORM.DELETE, (form) => {
    const formId = form.formId;
    const label = form.label || "this form";

    const confirmed = window.confirm(`Delete ${label}? This cannot be undone.`);

    if (!confirmed) {
      showToast("Delete cancelled.");
      return;
    }

    commandRegistry.execute("form.delete", { formId });
    showToast(`Form "${label}" deleted.`);
  }, "wiring");
}
