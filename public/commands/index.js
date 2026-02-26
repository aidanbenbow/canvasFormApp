import { registerAuthCommands } from "./auth/registerAuthCommands.js";
import { registerFormCommands } from "./forms/registerFormCommands.js";
import { registerArticleCommands } from "./articles/registerArticleCommands.js";
import { registerReportCommands } from "./reports/registerReportCommands.js";

export function registerAllCommands({
  commandRegistry,
  context,
  store,
  system,
  socket,
  showToast
}) {
  registerAuthCommands(commandRegistry, context, socket);
  registerFormCommands(commandRegistry, context, store, showToast);
  registerArticleCommands(commandRegistry, system);
  registerReportCommands(commandRegistry, system);
}