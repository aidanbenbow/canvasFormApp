import { ACTIONS } from '../../events/actions.js';
import { ROUTES } from '../../routes/routeNames.js';

export function registerFormEvents({ dispatcher, router, storeRef, commandRegistry, showToast }) {
  dispatcher.on(ACTIONS.FORM.VIEW, (form) => {
    router.push(ROUTES.formView, {
      formId: form.formId,
      results: storeRef.getFormResults(form.formId)
    });
  }, 'wiring.forms');

  dispatcher.on(ACTIONS.FORM.UPDATE, (form) => {
    const formId = form?.formId || form?.id;
    if (!formId) return;
    showToast?.(`Form "${form.label || formId}" updated.`);
  }, 'wiring.forms');

  dispatcher.on(ACTIONS.FORM.RESULTS, (form) => {
    const results = storeRef.getFormResults(form.formId);
    router.push(ROUTES.formResults, {
      id: 'formResultsScreen',
      router,
      results
    });
  }, 'wiring.forms');

  dispatcher.on(ACTIONS.FORM.CREATE, () => {
    router.push(ROUTES.formCreate, {
      id: 'createFormScreen'
    });
  }, 'wiring.forms');

  dispatcher.on(ACTIONS.FORM.EDIT, (form) => {
    router.push(ROUTES.formEdit, {
      id: 'editFormScreen',
      formId: form.formId
    });
  }, 'wiring.forms');

  dispatcher.on(ACTIONS.FORM.DELETE, (form) => {
    const formId = form.formId;
    const label = form.label || 'this form';

    const confirmed = window.confirm(`Delete ${label}? This cannot be undone.`);

    if (!confirmed) {
      showToast?.('Delete cancelled.');
      return;
    }

    commandRegistry.execute('form.delete', { formId });
    showToast?.(`Form "${label}" deleted.`);
  }, 'wiring.forms');
}