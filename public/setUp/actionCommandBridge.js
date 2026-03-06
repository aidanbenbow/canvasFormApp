import { ACTION_COMMAND_MAP } from './actionCommandMap.js';

export function registerActionCommandBridge(dispatcher, commandRegistry) {
  Object.entries(ACTION_COMMAND_MAP).forEach(([action, command]) => {
    dispatcher.on(action, (payload) => {
        console.log("ACTION → COMMAND", action, command, payload);
      commandRegistry.execute(command, payload);
    }, 'action-command-bridge');
  });
}