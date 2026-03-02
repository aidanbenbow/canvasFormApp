export function bindCommands({ manifest, commandRegistry }) {
  const bindings = manifest.commands || {};

  Object.entries(bindings).forEach(([uiCommandName, def]) => {
    const target = def.command;
    const staticPayload = def.payload || {};

    const aliases = [uiCommandName, `ui.${uiCommandName}`];
    const bridgeHandler = (uiPayload = {}) => {
      const merged = {
        ...staticPayload,
        ...uiPayload
      };

      commandRegistry.execute(target, merged);
    };

    aliases.forEach((alias) => {
      if (!commandRegistry.has(alias)) {
        commandRegistry.register(alias, bridgeHandler);
      }
    });
  });
}
