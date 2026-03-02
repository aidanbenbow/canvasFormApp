import { bootstrapCommands } from "./commandBootstrap.js";


export function bootstrapApp({
  commandRegistry,
  context,
  system,
  socket,
  showToast,
  screenRouter
}) {
  bootstrapCommands({
    commandRegistry,
    context,
    system,
    socket,
    showToast,
    screenRouter
  });
}