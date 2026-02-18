import { normalizeForm } from '../plugins/formManifests.js';
import { normalizeFields } from '../utils/normalizeFields.js';

export class FormModel {
  constructor(form) {
    this.form = form
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
  }

  getForm() {
    return this.form;
  }

  getFields() {
    return normalizeFields(this.form?.formStructure);
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
