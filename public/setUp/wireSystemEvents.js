import { registerArticleEvents } from './eventHandlers/articleEvents.js';
import { registerActionCommandBridge } from './actionCommandBridge.js';
import { registerDashboardEvents } from './eventHandlers/dashboardEvents.js';
import { registerFormEvents } from './eventHandlers/formEvents.js';

export function wireSystemEvents(system, context, router, factories, commandRegistry) {
  const dispatcher = system.actionDispatcher;
  const storeRef = context.store;

  const toastLayer = context.uiServices?.toastLayer;

  const showToast = (text) => {
    if (!toastLayer) return;
    const node = factories.basic.create({
      type: "text",
      text,
      id: `toast-${Date.now()}`,
      style: {
        font: "30px sans-serif",
        color: "#ffffff",
        backgroundColor: "#0b8f3a",
        borderColor: "#06702c",
        paddingX: 22,
        paddingY: 14,
        radius: 10,
        align: "center",
        shrinkToFit: true
      }
    });
    toastLayer.showMessage(node, { timeoutMs: 2500 });
  };

  registerActionCommandBridge(dispatcher, commandRegistry);

  registerDashboardEvents({
    dispatcher,
    context,
    router,
    commandRegistry
  });

  registerArticleEvents({
    dispatcher,
    router
  });

  registerFormEvents({
    dispatcher,
    router,
    storeRef,
    commandRegistry,
    showToast
  });
}
