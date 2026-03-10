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
    const fields = this.getFields();
    for (const field of fields) {
      if (field?.id === fieldId) return field;
      if (field?.type === 'fieldGroup' && Array.isArray(field?.children)) {
        const child = field.children.find((entry) => entry?.id === fieldId);
        if (child) return child;
      }
    }
    return null;
  }

  setFields(fields) {
    if (!this.form.formStructure || typeof this.form.formStructure !== 'object') {
      this.form.formStructure = { fields: [] };
    }
    const normalizedFields = Array.isArray(fields) ? fields : [];
    this.form.formStructure.fields = moveSubmitFieldsToEnd(normalizedFields);
  }

  addField(field) {
    this.setFields([...this.getFields(), field]);
  }

  deleteField(fieldId) {
    if (!fieldId) return;
    const topLevelFieldId = resolveOwningTopLevelFieldId(this.getFields(), fieldId);
    if (!topLevelFieldId) return;
    this.setFields(this.getFields().filter((field) => field.id !== topLevelFieldId));
  }

  reorderField(sourceFieldId, targetFieldId) {
    if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) return;

    const fields = [...this.getFields()];
    const sourceTopLevelId = resolveOwningTopLevelFieldId(fields, sourceFieldId);
    const targetTopLevelId = resolveOwningTopLevelFieldId(fields, targetFieldId);
    if (!sourceTopLevelId || !targetTopLevelId || sourceTopLevelId === targetTopLevelId) return;

    const sourceIndex = fields.findIndex((field) => field.id === sourceTopLevelId);
    const targetIndex = fields.findIndex((field) => field.id === targetTopLevelId);
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

function moveSubmitFieldsToEnd(fields) {
  const primary = [];
  const trailingSubmit = [];

  for (const field of fields) {
    if (isSubmitField(field)) {
      trailingSubmit.push(field);
      continue;
    }

    primary.push(field);
  }

  return [...primary, ...trailingSubmit];
}

function isSubmitField(field) {
  if (!field || typeof field !== 'object') return false;
  if (field.type !== 'button') return false;

  const label = String(field.label || field.text || '').trim().toLowerCase();
  const action = String(field.action || field.command || '').trim().toLowerCase();
  const id = String(field.id || '').trim().toLowerCase();

  if (label === 'submit') return true;
  if (action === 'form.submit') return true;
  if (id.startsWith('submit-')) return true;

  return false;
}

function resolveOwningTopLevelFieldId(fields = [], fieldId) {
  if (!fieldId) return null;

  for (const field of fields) {
    if (field?.id === fieldId) return fieldId;

    if (field?.type === 'fieldGroup' && Array.isArray(field?.children)) {
      const hasChild = field.children.some((child) => child?.id === fieldId);
      if (hasChild) return field.id;
    }
  }

  return null;
}
