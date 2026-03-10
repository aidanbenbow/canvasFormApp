export class DeleteFieldUseCase {
  constructor({ deleteField, getFields, getSelectedFieldId, selectField, refreshFormContainer } = {}) {
    this.deleteField = deleteField;
    this.getFields = getFields;
    this.getSelectedFieldId = getSelectedFieldId;
    this.selectField = selectField;
    this.refreshFormContainer = refreshFormContainer;
  }

  execute(fieldId) {
    if (!fieldId) return;

    const fieldsBeforeDelete = this.getFields?.() || [];
    const requestedOwnerId = resolveOwningTopLevelFieldId(fieldsBeforeDelete, fieldId) || fieldId;
    const selectedFieldId = this.getSelectedFieldId?.();
    const selectedOwnerId = resolveOwningTopLevelFieldId(fieldsBeforeDelete, selectedFieldId) || selectedFieldId;

    this.deleteField?.(fieldId);
    const fields = this.getFields?.() || [];

    if (selectedOwnerId && selectedOwnerId === requestedOwnerId) {
      this.selectField?.(fields[0]?.id ?? null);
      return;
    }

    this.refreshFormContainer?.();
  }
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
