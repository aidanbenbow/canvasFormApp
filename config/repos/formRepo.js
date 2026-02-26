import * as formDB from "../db/formDB.js";

export const formRepository = {
  createForm: formDB.upsertFormData,
  updateForm: formDB.updateFormData,
  deleteForm: formDB.deleteFormData,
  fetchForm: formDB.getFormDataById,
  fetchAllForms: formDB.fetchAllForms
};