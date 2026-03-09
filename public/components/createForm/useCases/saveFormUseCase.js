export class SaveFormUseCase {
  constructor({ requestSave } = {}) {
    this.requestSave = requestSave;
  }

  execute() {
    this.requestSave?.();
  }
}
