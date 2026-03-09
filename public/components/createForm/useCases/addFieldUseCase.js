export class AddFieldUseCase {
  constructor({ fieldFactory, getSelectedFieldId, getFieldById, addField, selectField, getFields, setFields } = {}) {
    this.fieldFactory = fieldFactory;
    this.getSelectedFieldId = getSelectedFieldId;
    this.getFieldById = getFieldById;
    this.addField = addField;
    this.selectField = selectField;
    this.getFields = getFields;
    this.setFields = setFields;
  }

  execute(type) {
    const newField = this.fieldFactory?.(type);
    if (!newField) return;

    if (shouldAutoAttachLabel(newField)) {
      const autoLabel = buildAutoLabelForField(newField);
      const currentFields = this.getFields?.();

      if (Array.isArray(currentFields) && typeof this.setFields === 'function') {
        this.setFields([...currentFields, autoLabel, newField]);
      } else {
        this.addField?.(autoLabel);
        this.addField?.(newField);
      }

      this.selectField?.(autoLabel.id);
      return;
    }

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

function shouldAutoAttachLabel(field) {
  return isLabelBindingTarget(field);
}

function buildAutoLabelForField(field) {
  const fieldId = String(field?.id || '').trim();
  const labelText = String(field?.label || field?.text || field?.placeholder || 'New Field').trim() || 'New Field';
  field.label = labelText;
  field.name = toInputName(labelText);

  return {
    id: `label-${fieldId}`,
    type: 'label',
    text: labelText,
    label: labelText,
    forFieldId: fieldId
  };
}

function toInputName(labelText) {
  const normalized = String(labelText || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || 'field';
}
