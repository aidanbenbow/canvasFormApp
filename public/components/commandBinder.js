export function bindCommands({ manifest, commandRegistry }) {
  const bindings = manifest.commands || {};

  Object.entries(bindings).forEach(([uiCommandName, def]) => {
    const target = def.command;
    const staticPayload = def.payload || {};

    const namespaced = `ui.${uiCommandName}`;

    if (!commandRegistry.has(namespaced)) {
      commandRegistry.register(namespaced, (uiPayload = {}) => {
        const merged = {
          ...staticPayload,
          ...uiPayload
        };

        commandRegistry.execute(target, merged);
      });
    }
  });
}
