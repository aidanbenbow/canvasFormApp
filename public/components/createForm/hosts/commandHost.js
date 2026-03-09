import { buildCreateFormCommandNames } from '../createFormCommands.js';
import { CommandLifecycleFeature } from '../features/commandLifecycleFeature.js';

export class CommandHost {
  constructor({ id, commandAdapter, engine, getCommandHandlers } = {}) {
    this.commands = buildCreateFormCommandNames(id);

    this.commandLifecycleFeature = new CommandLifecycleFeature({
      commandAdapter,
      getCommands: () => this.getCommands(),
      getCommandHandlers,
      engine
    });
  }

  getCommands() {
    return { ...this.commands };
  }

  attach() {
    this.commandLifecycleFeature.attach();
  }

  detach() {
    this.commandLifecycleFeature.detach();
  }

  getLifecycleFeature() {
    return this.commandLifecycleFeature;
  }
}
