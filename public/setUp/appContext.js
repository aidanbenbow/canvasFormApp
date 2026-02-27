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