export class FieldUseCases {
  constructor({ addFieldUseCase, deleteFieldUseCase } = {}) {
    this.addFieldUseCase = addFieldUseCase;
    this.deleteFieldUseCase = deleteFieldUseCase;
  }

  add(type) {
    this.addFieldUseCase?.execute?.(type);
  }

  delete(fieldId) {
    this.deleteFieldUseCase?.execute?.(fieldId);
  }
}
