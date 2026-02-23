import { FormModel } from '../../models/formModel.js';
import { registerCreateFormCommands } from './createFormCommands.js';

export function createFormModelAdapter(form) {
  const model = new FormModel(form);

  return {
    getForm: () => model.getForm(),
    getFields: () => model.getFields(),
    setFields: (fields) => model.setFields(fields),
    addField: (field) => model.addField(field),
    deleteField: (fieldId) => model.deleteField(fieldId),
    reorderField: (sourceFieldId, targetFieldId) => model.reorderField(sourceFieldId, targetFieldId),
    normalize: () => model.normalize(),
    getFieldById: (fieldId) => model.getFieldById(fieldId)
  };
}

export function createCommandRegistryAdapter(commandRegistry) {
  return {
    getCommandRegistry: () => commandRegistry,
    registerCommands({ commands, handlers }) {
      registerCreateFormCommands({
        commandRegistry,
        commands,
        handlers
      });
    },
    unregisterCommands({ commands }) {
      if (!commandRegistry || !commands) return;
      const commandNames = Object.values(commands).filter((name) => typeof name === 'string');

      if (typeof commandRegistry.unregisterMany === 'function') {
        commandRegistry.unregisterMany(commandNames);
        return;
      }

      if (typeof commandRegistry.unregister === 'function') {
        for (const name of commandNames) {
          commandRegistry.unregister(name);
        }
      }
    }
  };
}

export function createUiAdapter(factories) {
  return {
    createNode: (definition) => factories?.basic?.create(definition),
    invalidateRoot: (rootNode) => rootNode?.invalidate?.()
  };
}

export function createPersistenceAdapter({
  onSave,
  onUpdate
} = {}) {
  return {
    onSave,
    onUpdate
  };
}
