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

  updateForm(form) {
    const prev = storeInstance.getState();
    const nextForms = { ...prev.forms, [form.formId]: form };

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