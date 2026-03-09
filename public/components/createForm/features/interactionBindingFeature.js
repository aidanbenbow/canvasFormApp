export class InteractionBindingFeature {
  constructor({ getContainer, interactionController }) {
    this.getContainer = getContainer;
    this.interactionController = interactionController;
  }

  attach() {
    const container = this.getContainer?.();
    if (!container) return;

    this.interactionController?.bindSelectionHandlers?.(container);
    this.interactionController?.cacheNodes?.(container);
    this.interactionController?.applyPreviewVisuals?.();
  }

  detach() {}

  onRender() {
    return true;
  }

  onRuntime() {
    return false;
  }
}
