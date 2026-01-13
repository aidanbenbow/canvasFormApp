import { BaseUIFactory } from "./baseUiFactory.js";

export class CommandUIFactory extends BaseUIFactory {
  createComponent(def) {
    if (def.type === "button") {
      return super.createComponent({
        ...def,
        onClick: () => {
          if (def.command) {
            this.context.commandRegistry.execute(def.command);
          }
        }
      });
    }

    return super.createComponent(def);
  }
}