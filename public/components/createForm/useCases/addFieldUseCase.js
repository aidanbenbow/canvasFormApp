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
      const fieldGroup = buildAutoFieldGroupForField(newField);
      const currentFields = this.getFields?.();

      if (Array.isArray(currentFields) && typeof this.setFields === 'function') {
        this.setFields([...currentFields, fieldGroup]);
      } else {
        this.addField?.(fieldGroup);
      }

      this.selectField?.(fieldGroup.id);
      return;
    }

    if (newField?.type === 'label') {
      const selectedFieldId = this.getSelectedFieldId?.();
      const selectedField = this.getFieldById?.(selectedFieldId);
      const bindingTarget = resolveLabelBindingTarget(selectedField);
      if (isLabelBindingTarget(bindingTarget)) {
        newField.forFieldId = bindingTarget.id;
        const seedLabel = String(bindingTarget.label || bindingTarget.text || '').trim();
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

function buildAutoFieldGroupForField(field) {
  const fieldId = String(field?.id || '').trim();
  const labelText = String(field?.label || field?.text || field?.placeholder || 'New Field').trim() || 'New Field';
  field.label = labelText;
  field.name = toInputName(labelText);

  const label = {
    id: `label-${fieldId}`,
    type: 'label',
    text: labelText,
    label: labelText,
    forFieldId: fieldId
  };

  return {
    id: `group-${fieldId}`,
    type: 'fieldGroup',
    children: [label, field]
  };
}

function resolveLabelBindingTarget(field) {
  if (!field || typeof field !== 'object') return null;
  if (isLabelBindingTarget(field)) return field;
  if (field.type !== 'fieldGroup' || !Array.isArray(field.children)) return null;

  return field.children.find((child) => isLabelBindingTarget(child)) ?? null;
}

function toInputName(labelText) {
  const normalized = String(labelText || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || 'field';
}
