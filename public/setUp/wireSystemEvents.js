import { articleViewScreen } from "../components/articleView.js";
import { CreateForm } from "../components/createForm.js";
import { DashBoardScreen } from "../components/dashBoard.js";
import { EditForm } from "../components/editForm.js";
import { UIFormResults } from "../components/formResults.js";
import { FormViewScreen } from "../components/viewForm.js";

import { ACTIONS } from "../events/actions.js";
import { formStore } from "../stores/storeInstance.js";
import { formService } from "../services/formservice.js";

export function wireSystemEvents(system, context, router, factories, commandRegistry) {
  const dispatcher = system.actionDispatcher;
  const bus = system.eventBusManager;
  const storeRef = formStore;

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

    const dash = new DashBoardScreen({
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry
    });

    router.replace(dash);
  }, "wiring");

  // VIEW FORM
  dispatcher.on(ACTIONS.FORM.VIEW, (form) => {
    formService.setActiveForm(form.formId);

    const view = new FormViewScreen({
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry,
      formId: form.formId,
      results: storeRef.getFormResults(form.formId)
    });

    router.push(view);
  }, "wiring");

  // VIEW ARTICLE
  dispatcher.on(ACTIONS.ARTICLE.VIEW, (article) => {
    const view = new articleViewScreen({
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry,
      article
    });

    router.push(view);
  }, "wiring");

  // EDIT ARTICLE
  dispatcher.on(ACTIONS.ARTICLE.EDIT, (article) => {
    const editor = new articleViewScreen({
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry,
      article,
      mode: "edit"
    });

    router.push(editor);
  }, "wiring");

  // FORM RESULTS
  dispatcher.on(ACTIONS.FORM.RESULTS, (form) => {
    formService.setActiveForm(form.formId);

    const results = storeRef.getFormResults(form.formId);

    const resultView = new UIFormResults({
      id: "formResultsScreen",
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry,
      router,
      results
    });

    router.push(resultView);
  }, "wiring");

  // CREATE FORM
  dispatcher.on(ACTIONS.FORM.CREATE, () => {
    const creator = new CreateForm({
      id: "createFormScreen",
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry
    });

    router.push(creator);
  }, "wiring");

  // EDIT FORM
  dispatcher.on(ACTIONS.FORM.EDIT, (form) => {
    formService.setActiveForm(form.formId);

    const editor = new EditForm({
      id: "editFormScreen",
      context,
      dispatcher,
      eventBusManager: bus,
      store: storeRef,
      factories,
      commandRegistry
    });

    router.push(editor);
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

// import { articleViewScreen } from "../components/articleView.js";
// import { CreateForm } from "../components/createForm.js";
// import { DashBoardScreen } from "../components/dashBoard.js";
// import { EditForm } from "../components/editForm.js";
// import { UIFormResults } from "../components/formResults.js";
// import { FormViewScreen } from "../components/viewForm.js";

// import { onDelete, saveFormStructure, sendLog, updateArticle } from "../controllers/socketController.js";
// import { ACTIONS } from "../events/actions.js";

// export function wireSystemEvents(system, context, store ={}, router, factories, commandRegistry) {
//     const dispatcher = system.actionDispatcher;
//     const bus = system.eventBusManager;
//     const toastLayer = context.uiServices?.toastLayer;

//     const showToast = (text) => {
//       if (!toastLayer) return;
//       const node = factories.basic.create({
//         type: 'text',
//         text,
//         id: `toast-${Date.now()}`,
//         style: {
//           font: "30px sans-serif",
//           color: "#ffffff",
//           backgroundColor: "#0b8f3a",
//           borderColor: "#06702c",
//           paddingX: 22,
//           paddingY: 14,
//           radius: 10,
//           align: "center",
//           shrinkToFit: true
//         }
//       });
//       toastLayer.showMessage(node, { timeoutMs: 2500 });
//     };

//     dispatcher.on(ACTIONS.DASHBOARD.SHOW, (forms)=> {
//       console.log('[DEBUG] ACTIONS.DASHBOARD.SHOW called with forms:', forms);
//       // Stop editing any active input or text editor to hide caret
//       if (context?.textEditorController?.activeNode) {
//         context.textEditorController.stopEditing();
//       }
//       const dash = new DashBoardScreen({ context, dispatcher, eventBusManager: bus, store, factories, commandRegistry  });
//       router.replace(dash);
//       dispatcher.dispatch(ACTIONS.FORM.SET_LIST,forms)
//     },'wiring');

//     dispatcher.on(ACTIONS.FORM.VIEW, async (form) => {
//       dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
//       console.log(`Viewing form with id: ${form.formId}`);

//       const view = new FormViewScreen({
//         context,
//         dispatcher,
//         eventBusManager: bus,
//         store,
//         factories,
//         commandRegistry,
//         formId: form.formId,
//         onSubmit: (responseData) => {
//           dispatcher.dispatch(ACTIONS.FORM.SUBMIT, {
//             form: store.getActiveForm(),
//             responseData
//           })
//         },
//         results: store.getFormResults(form.formId)
//       });

//       router.push(view);
//     }, "wiring");
  
//     dispatcher.on(ACTIONS.ARTICLE.VIEW, async (article) => {
//       console.log(`Viewing article with id: ${article.userId}`);
//       // Implement article viewing logic here
//       const view = new articleViewScreen({
//         context,
//         dispatcher,
//         eventBusManager: bus,
//         store,
//         factories,
//         commandRegistry,
//         article
//       });
//       router.push(view);

//     }
//     , "wiring");

//     dispatcher.on(ACTIONS.ARTICLE.EDIT, async (article) => {
//       if (!article) return;

//       const editor = new articleViewScreen({
//         context,
//         dispatcher,
//         eventBusManager: bus,
//         store,
//         factories,
//         commandRegistry,
//         article,
//         mode: 'edit',
//         onSave: ({ articleId, updates }) => updateArticle(articleId, updates)
//       });

//       router.push(editor);
//     }, "wiring");

//     dispatcher.on(ACTIONS.FORM.RESULTS, async (form) => {
//       dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
//       const results = store.getFormResults(form.formId);
//       const resultView = new UIFormResults({
//         id: 'formResultsScreen',
//         context,
//         dispatcher,
//         eventBusManager: bus,
//         store,
//         factories,
//         commandRegistry,
//         router,
//         results
//       });
//       router.push(resultView);

//     }, 'wiring');

//     dispatcher.on(ACTIONS.FORM.CREATE, async (form) => {
//         dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

//       const creator = new CreateForm({ id: 'createFormScreen', context, dispatcher, eventBusManager: bus, store, factories, commandRegistry,
//         onSubmit: (updatedForm) => {
//             dispatcher.dispatch(ACTIONS.FORM.ADD, updatedForm);
//             saveFormStructure({
//                 id: updatedForm.id,
//                 formStructure: updatedForm.formStructure,
//                 label: updatedForm.label,
//                 user: updatedForm.user,
//                 resultsTable: updatedForm.resultsTable,
//               });
//               showToast(`Form ${updatedForm.label} created successfully!`);
//         } });
//       router.push(creator);
//     }, 'wiring');

//     dispatcher.on(ACTIONS.FORM.EDIT, async (form) => {
//         dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);

//       const editor = new EditForm({ id: 'editFormScreen', context, dispatcher, eventBusManager: bus, store, factories, commandRegistry,
//         onSubmit: (updatedForm) => {
//             dispatcher.dispatch(ACTIONS.FORM.UPDATE, updatedForm);
//             saveFormStructure({
//                 id: updatedForm.id,
//                 formStructure: updatedForm.formStructure,
//                 label: updatedForm.label,
//                 user: updatedForm.user,
//               resultsTable: updatedForm.resultsTable,
//             });
//         } });
//       router.push(editor);
//     }, 'wiring');

//     dispatcher.on(ACTIONS.FORM.SUBMIT, async (payload) => {
//     const formId = payload?.formId;
//     const fields = payload?.fields || {};
//     const user = payload?.user || 'anonymous';

//     if (!formId) {
//         showToast('Submission failed: missing formId');
//         return;
//     }

//     const formResultPayload = { formId, fields, user };

//     console.log(`Submitting form with id: ${formId}`, formResultPayload);

//     sendLog(
//         `Form ${formId} submitted with data: ${JSON.stringify(formResultPayload)}`,
//         formResultPayload
//     );

//     showToast('Form submitted successfully!');
// }, 'wiring');

//     dispatcher.on(ACTIONS.FORM.DELETE, async (form) => {
//         dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form);
//          const formId = form?.id;
//          const formLabel = String(form?.label || 'this form').trim();
//          const confirmed = window.confirm(`Delete ${formLabel}? This action cannot be undone.`);
//          if (!confirmed) {
//         showToast('Delete cancelled.');
//         return;
//          }

//        console.log(`Deleting form with id: ${formId}`);
//          onDelete({id: formId});
//         //store.removeForm(form.id);
//         context.pipeline.invalidate();
//     }, 'wiring');

 
// }