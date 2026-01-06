// commandBinder.js
export function bindCommands({ manifest, commandRegistry, dispatcher, store, namespace }) {
    const commands = manifest.commands || {};
  
    Object.entries(commands).forEach(([name, def]) => {
      commandRegistry.register(name, () => {
        if (def.needsActive) {
          const active = store.getActiveForm();
          if (!active) return;
          dispatcher.dispatch(def.action, active, namespace);
        } else {
          dispatcher.dispatch(def.action, null, namespace);
        }
      });
    });
  }