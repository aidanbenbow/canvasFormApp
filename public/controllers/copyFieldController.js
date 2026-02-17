export class CopyFieldController {
  constructor({ context, commandRegistry }) {
    this.context = context;
    this.commandRegistry = commandRegistry;
    this.registeredCommands = new Set();
  }

  ensureCopyCommand(screenId, fieldId) {
    const commandName = `${screenId}.copy.${fieldId}`;
    if (this.registeredCommands.has(commandName)) {
      return commandName;
    }

    this.commandRegistry.register(commandName, async () => {
      const node = this.context?.fieldRegistry?.get(fieldId);
      const value = node?.getValue?.() ?? node?.value ?? '';
      const text = String(value || '');
      if (!text) return;

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return;
        } catch (_) {
        }
      }

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });

    this.registeredCommands.add(commandName);
    return commandName;
  }
}