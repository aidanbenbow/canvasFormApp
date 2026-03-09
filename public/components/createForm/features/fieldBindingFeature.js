export class FieldBindingFeature {
  constructor({ getContainer, fieldBindingController }) {
    this.getContainer = getContainer;
    this.fieldBindingController = fieldBindingController;
  }

  attach() {
    const container = this.getContainer?.();
    if (!container) return;
    this.fieldBindingController?.bindEditableNodes?.(container);
  }

  detach() {}

  onRender() {
    return true;
  }

  onRuntime() {
    return false;
  }
}
