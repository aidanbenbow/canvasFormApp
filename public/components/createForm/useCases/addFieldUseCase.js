export class AddFieldUseCase {
  constructor({ fieldFactory, getSelectedFieldId, getFieldById, addField, selectField } = {}) {
    this.fieldFactory = fieldFactory;
    this.getSelectedFieldId = getSelectedFieldId;
    this.getFieldById = getFieldById;
    this.addField = addField;
    this.selectField = selectField;
  }

  execute(type) {
    const newField = this.fieldFactory?.(type);
    if (!newField) return;

    if (newField?.type === 'label') {
      const selectedFieldId = this.getSelectedFieldId?.();
      const selectedField = this.getFieldById?.(selectedFieldId);
      if (isLabelBindingTarget(selectedField)) {
        newField.forFieldId = selectedField.id;
        const seedLabel = String(selectedField.label || selectedField.text || '').trim();
        if (seedLabel) {
          newField.label = seedLabel;
          newField.text = seedLabel;
        }
      }
    }

    this.addField?.(newField);
    this.selectField?.(newField.id);
  }
}

function isLabelBindingTarget(field) {
  if (!field || typeof field !== 'object') return false;
  return field.type === 'input' || field.type === 'photo' || field.type === 'dropDown';
}
