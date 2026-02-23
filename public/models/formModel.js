import { normalizeForm } from '../plugins/formManifests.js';
import { normalizeFields } from '../utils/normalizeFields.js';

export class FormModel {
  constructor(form) {
    const hasExistingForm = Boolean(form);
    this.form = hasExistingForm
      ? structuredClone(form)
      : {
          id: `form-${Date.now()}`,
          label: 'new form',
          formStructure: {
            fields: [
              {
                id: `title-${Date.now()}`,
                type: 'text',
                label: 'Form Title'
              },
              {
                id: `submit-${Date.now()}`,
                type: 'button',
                label: 'Submit'
              }
            ]
          },
          user: 'admin'
        };

    if (!hasExistingForm) {
      this.form.resultsTable = buildAutoResultsTableName(this.form.id);
    }
  }

  getForm() {
    return this.form;
  }

  getFields() {
    return normalizeFields(this.form?.formStructure);
  }

  getResultsTable() {
    return this.form?.resultsTable || null;
  }

  setResultsTable(resultsTable) {
    if (typeof resultsTable !== 'string') return;
    const nextResultsTable = resultsTable.trim();
    if (!nextResultsTable) return;
    this.form.resultsTable = nextResultsTable;
  }

  getFieldById(fieldId) {
    if (!fieldId) return null;
    return this.getFields().find((field) => field?.id === fieldId) ?? null;
  }

  setFields(fields) {
    if (!this.form.formStructure || typeof this.form.formStructure !== 'object') {
      this.form.formStructure = { fields: [] };
    }
    this.form.formStructure.fields = Array.isArray(fields) ? fields : [];
  }

  addField(field) {
    this.setFields([...this.getFields(), field]);
  }

  deleteField(fieldId) {
    if (!fieldId) return;
    this.setFields(this.getFields().filter((field) => field.id !== fieldId));
  }

  reorderField(sourceFieldId, targetFieldId) {
    if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) return;

    const fields = [...this.getFields()];
    const sourceIndex = fields.findIndex((field) => field.id === sourceFieldId);
    const targetIndex = fields.findIndex((field) => field.id === targetFieldId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const [movedField] = fields.splice(sourceIndex, 1);
    fields.splice(targetIndex, 0, movedField);
    this.setFields(fields);
  }

  normalize() {
    return normalizeForm(this.form);
  }
}

function buildAutoResultsTableName(formId) {
  const normalizedFormId = String(formId || `form-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_');

  const baseName = `form_results_${normalizedFormId}`;
  const minLength = 3;
  const maxLength = 255;
  const trimmed = baseName.slice(0, maxLength);

  if (trimmed.length >= minLength) return trimmed;
  return `frm_${Date.now()}`;
}
