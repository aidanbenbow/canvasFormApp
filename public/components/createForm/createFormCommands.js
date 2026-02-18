export function buildCreateFormCommandNames(screenId) {
  return {
    saveCommand: `${screenId}.save`,
    saveBrightnessCommand: `${screenId}.saveBrightness`,
    addTextCommand: `${screenId}.addText`,
    addInputCommand: `${screenId}.addInput`,
    addLabelCommand: `${screenId}.addLabel`,
    addPhotoCommand: `${screenId}.addPhoto`,
    deleteFieldCommand: `${screenId}.deleteField`
  };
}

export function registerCreateFormCommands({ commandRegistry, commands, handlers }) {
  if (!commandRegistry || !commands || !handlers) return;

  commandRegistry.register(commands.saveCommand, () => handlers.onSave?.());
  commandRegistry.register(
    commands.saveBrightnessCommand,
    ({ fieldId } = {}) => handlers.onSaveBrightness?.(fieldId)
  );
  commandRegistry.register(commands.addTextCommand, () => handlers.onAddComponent?.('text'));
  commandRegistry.register(commands.addInputCommand, () => handlers.onAddComponent?.('input'));
  commandRegistry.register(commands.addLabelCommand, () => handlers.onAddComponent?.('label'));
  commandRegistry.register(commands.addPhotoCommand, () => handlers.onAddComponent?.('photo'));
  commandRegistry.register(commands.deleteFieldCommand, ({ fieldId } = {}) => handlers.onDeleteField?.(fieldId));
}
