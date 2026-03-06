// public/services/formService.js
let storeInstance = null;

export function setFormStore(store) {
  storeInstance = store;
}

export const formService = {
  setForms(formsArray) {
    const nextForms = {};
    for (const f of formsArray) {
      nextForms[f.formId] = f;
    }

    const nextState = {
      ...storeInstance.getState(),
      forms: nextForms
    };

    storeInstance.apply(nextState);
  },

  setActiveForm(formId) {
    const nextState = {
      ...storeInstance.getState(),
      activeFormId: formId
    };

    storeInstance.apply(nextState);
  },

  updateForm(formOrId, updates) {
    const isIdCall = typeof formOrId === 'string';
    const formId = isIdCall
      ? formOrId
      : (formOrId?.formId || formOrId?.id);

    if (!formId) return;

    const prev = storeInstance.getState();
    const existing = prev.forms?.[formId] || {};
    const incoming = isIdCall
      ? (updates || {})
      : (formOrId || {});

    const nextForm = {
      ...existing,
      ...incoming,
      formId
    };

    if (existing.id && !nextForm.id) {
      nextForm.id = existing.id;
    }

    const nextForms = { ...prev.forms, [formId]: nextForm };

    const nextState = {
      ...prev,
      forms: nextForms
    };

    storeInstance.apply(nextState);
  },

  removeForm(formId) {
    const prev = storeInstance.getState();
    const nextForms = { ...prev.forms };
    delete nextForms[formId];

    const nextState = {
      ...prev,
      forms: nextForms,
      activeFormId: prev.activeFormId === formId ? null : prev.activeFormId
    };

    storeInstance.apply(nextState);
  },

  setResults(formId, results) {
    const prev = storeInstance.getState();
    const nextResults = { ...prev.results, [formId]: [...results] };

    const nextState = {
      ...prev,
      results: nextResults
    };

    storeInstance.apply(nextState);
  },

  addResults(formId, newResults) {
    const prev = storeInstance.getState();
    const existing = prev.results[formId] || [];
    const nextResults = {
      ...prev.results,
      [formId]: [...existing, ...newResults]
    };

    const nextState = {
      ...prev,
      results: nextResults
    };

    storeInstance.apply(nextState);
  }
};