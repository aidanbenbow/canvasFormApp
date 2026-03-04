export class CommandLifecycleFeature {
  constructor({ commandAdapter, getCommands, getCommandHandlers, engine }) {
    this.commandAdapter = commandAdapter;
    this.getCommands = getCommands;
    this.getCommandHandlers = getCommandHandlers;
    this.engine = engine;
    this.isAttached = false;
  }

  attach() {
    if (this.isAttached) return;

    this.commandAdapter?.registerCommands?.({
      commands: this.getCommands?.(),
      handlers: this.getCommandHandlers?.(),
      engine: this.engine
    });

    this.isAttached = true;
  }

  detach() {
    if (!this.isAttached) return;

    this.commandAdapter?.unregisterCommands?.({
      commands: this.getCommands?.(),
      engine: this.engine
    });

    this.isAttached = false;
  }
}
