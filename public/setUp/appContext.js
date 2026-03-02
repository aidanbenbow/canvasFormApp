export class AppContext {
  constructor({
    commandRegistry,
    screenRouter,
    screenRegistry,
    uiEngine,
    rendererContext,
    repositories,
    services,
    uiServices,
    input,
    state
  }) {
    this.commandRegistry = commandRegistry;
    this.screenRouter = screenRouter;
    this.screenRegistry = screenRegistry;
    this.uiEngine = uiEngine;
    this.renderer = rendererContext;

    this.repositories = repositories;
    this.services = services;
    this.uiServices = uiServices;
    this.input = input;
    this.state = state;
  }
}

export function createLegacyAppContext({
  container,
  tokens,
  screenRegistry,
  repositories,
  services,
  uiServices,
  input,
  state,
}) {
  const resolveFromContainer = (token, fallbackValue = null) => {
    if (!container || !token) return fallbackValue;
    if (typeof container.tryResolve === "function") {
      return container.tryResolve(token) ?? fallbackValue;
    }
    if (typeof container.resolve === "function") {
      try {
        return container.resolve(token);
      } catch {
        return fallbackValue;
      }
    }
    return fallbackValue;
  };

  return new AppContext({
    commandRegistry: resolveFromContainer(tokens?.commandRegistry),
    screenRouter: resolveFromContainer(tokens?.screenRouter),
    screenRegistry,
    uiEngine: resolveFromContainer(tokens?.uiEngine),
    rendererContext: resolveFromContainer(tokens?.rendererContext),
    repositories,
    services,
    uiServices,
    input,
    state,
  });
}