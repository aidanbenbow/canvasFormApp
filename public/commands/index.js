import { registerAuthCommands } from "./auth/registerAuthCommands.js";
import { registerFormCommands } from "./forms/registerFormCommands.js";
import { registerArticleCommands } from "./articles/registerArticleCommands.js";
import { registerReportCommands } from "./reports/registerReportCommands.js";
import { registerAppCommands } from "./app/registerAppCommands.js";

export function registerAllCommands({
  commandRegistry,
  context,
  store,
  formService,
  system,
  socket,
  showToast,
  screenRouter
}) {
  registerAuthCommands(commandRegistry, context, socket);
  registerFormCommands(commandRegistry, context, store, formService, showToast);
  registerArticleCommands(commandRegistry, system);
  registerReportCommands(commandRegistry, system);
  registerAppCommands(commandRegistry, context, { screenRouter });
}