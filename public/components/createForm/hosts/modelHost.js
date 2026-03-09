import { FORM_BUILDER_ENGINE_EVENTS } from '../formBuilderEngineEvents.js';

export class ModelHost {
  constructor({ modelAdapter, persistenceAdapter = {}, onSubmit, emit, getMode, getEngine } = {}) {
    this.modelAdapter = modelAdapter;
    this.persistenceAdapter = persistenceAdapter;
    this.onSubmit = onSubmit;
    this.emit = emit;
    this.getMode = getMode;
    this.getEngine = getEngine;
  }

  requestSave() {
    const normalizedForm = this.modelAdapter.normalize();
    this.emit?.(FORM_BUILDER_ENGINE_EVENTS.saveRequested, { form: normalizedForm });

    const hasPersistenceAdapter = typeof this.persistenceAdapter?.onSave === 'function';
    this.persistenceAdapter?.onSave?.(normalizedForm, {
      mode: this.getMode?.(),
      engine: this.getEngine?.()
    });

    if (!hasPersistenceAdapter) {
      this.onSubmit?.(normalizedForm);
    }
  }

  requestBrightnessPersist(fieldId) {
    const normalizedForm = this.modelAdapter.normalize();
    this.emit?.(FORM_BUILDER_ENGINE_EVENTS.brightnessPersistRequested, { fieldId, form: normalizedForm });

    const hasPersistenceAdapter = typeof this.persistenceAdapter?.onUpdate === 'function';
    this.persistenceAdapter?.onUpdate?.(normalizedForm, {
      mode: this.getMode?.(),
      reason: 'brightness',
      fieldId,
      engine: this.getEngine?.()
    });

    if (!hasPersistenceAdapter) {
      this.handleBrightnessPersistFallback({ fieldId, normalizedForm });
    }
  }

  handleBrightnessPersistFallback() {}

  getForm() {
    if (typeof this.modelAdapter.getForm === 'function') {
      return this.modelAdapter.getForm();
    }

    return this.normalize();
  }

  getFields() {
    return this.getNormalizedFields();
  }

  getNormalizedFields() {
    return this.modelAdapter.getFields();
  }

  setNormalizedFields(fields) {
    this.modelAdapter.setFields(fields);
  }

  getFieldById(fieldId) {
    if (!fieldId) return null;
    if (typeof this.modelAdapter.getFieldById === 'function') {
      return this.modelAdapter.getFieldById(fieldId);
    }

    return this.getNormalizedFields().find((field) => field?.id === fieldId) ?? null;
  }

  addField(field) {
    this.modelAdapter.addField(field);
  }

  deleteField(fieldId) {
    this.modelAdapter.deleteField(fieldId);
  }

  reorderField(sourceFieldId, targetFieldId) {
    this.modelAdapter.reorderField(sourceFieldId, targetFieldId);
  }

  normalize() {
    return this.modelAdapter.normalize();
  }
}
