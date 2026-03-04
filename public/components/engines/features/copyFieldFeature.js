import { CopyFieldController } from '../../../controllers/copyFieldController.js';
import { isCopyCandidateField } from '../../../utils/fieldGuards.js';

export class CopyFieldFeature {
  constructor({ context, commandRegistry, screenId }) {
    this.context = context;
    this.commandRegistry = commandRegistry;
    this.screenId = screenId;
    this.controller = new CopyFieldController({
      context: this.context,
      commandRegistry: this.commandRegistry
    });
  }

  attach() {}

  detach() {
    for (const commandName of this.controller.registeredCommands) {
      this.commandRegistry?.unregister?.(commandName);
    }
    this.controller.registeredCommands.clear();
  }

  shouldAddCopyButton(field) {
    return isCopyCandidateField(field);
  }

  ensureCopyCommand(fieldId) {
    return this.controller.ensureCopyCommand(this.screenId, fieldId);
  }
}
