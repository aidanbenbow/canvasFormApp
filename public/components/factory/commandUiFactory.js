import { BaseUIFactory } from "./baseUiFactory.js";

export class CommandUIFactory extends BaseUIFactory {
    createButtons(defs, commandRegistry) {
      return defs.map(def =>
        this.create({
          id: `cmd-${def.id}`,
          type: 'button',
          label: def.label,
          onClick: () => commandRegistry.execute(def.command)
        })
      );
    }
  }