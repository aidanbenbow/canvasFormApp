import * as formDB from "../db/formDB.js";

export const formRepository = {
  createForm: formDB.upsertFormData,
  updateForm: (formId, updates = {}) => {
    if (updates && typeof updates === 'object' && !Array.isArray(updates)) {
      const nextFormStructure = updates.formStructure ?? updates.fields ?? updates;
      const nextLabel = updates.label ?? updates.title ?? 'Untitled';
      const nextResultsTable = updates.resultsTable ?? null;
      return formDB.updateFormData(formId, nextFormStructure, nextLabel, nextResultsTable);
    }

    return formDB.updateFormData(formId, updates);
  },
  deleteForm: formDB.deleteFormData,
  fetchForm: formDB.getFormDataById,
  fetchAllForms: formDB.fetchAllForms
};