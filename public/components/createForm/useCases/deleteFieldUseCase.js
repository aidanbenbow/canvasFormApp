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

    this.deleteField?.(fieldId);
    const fields = this.getFields?.() || [];

    if (this.getSelectedFieldId?.() === fieldId) {
      this.selectField?.(fields[0]?.id ?? null);
      return;
    }

    this.refreshFormContainer?.();
  }
}
