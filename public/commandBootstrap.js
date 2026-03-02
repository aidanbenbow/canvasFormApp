import { registerAllCommands } from "./commands/index.js";
import { formStore } from "./stores/storeInstance.js";
import { formService } from "./services/formservice.js";

export function bootstrapCommands({ commandRegistry, context, system, socket, showToast, screenRouter }) {
formStore.connect(system.eventBus)

  registerAllCommands({
    commandRegistry,
    context,
    store: formStore,
    formService,
    system,
    socket,
    showToast,
    screenRouter
  });
}