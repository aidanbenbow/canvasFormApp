// public/services/formService.js
import { formStore } from "../stores/storeInstance.js";

export const formService = {
  setForms(formsArray) {
    const nextForms = {};
    for (const f of formsArray) {
      nextForms[f.formId] = f;
    }

    const nextState = {
      ...formStore.getState(),
      forms: nextForms
    };

    formStore.apply(nextState);
  },

  setActiveForm(formId) {
    const nextState = {
      ...formStore.getState(),
      activeFormId: formId
    };

    formStore.apply(nextState);
  },

  updateForm(form) {
    const prev = formStore.getState();
    const nextForms = { ...prev.forms, [form.formId]: form };

    const nextState = {
      ...prev,
      forms: nextForms
    };

    formStore.apply(nextState);
  },

  removeForm(formId) {
    const prev = formStore.getState();
    const nextForms = { ...prev.forms };
    delete nextForms[formId];

    const nextState = {
      ...prev,
      forms: nextForms,
      activeFormId: prev.activeFormId === formId ? null : prev.activeFormId
    };

    formStore.apply(nextState);
  },

  setResults(formId, results) {
    const prev = formStore.getState();
    const nextResults = { ...prev.results, [formId]: [...results] };

    const nextState = {
      ...prev,
      results: nextResults
    };

    formStore.apply(nextState);
  },

  addResults(formId, newResults) {
    const prev = formStore.getState();
    const existing = prev.results[formId] || [];
    const nextResults = {
      ...prev.results,
      [formId]: [...existing, ...newResults]
    };

    const nextState = {
      ...prev,
      results: nextResults
    };

    formStore.apply(nextState);
  }
};