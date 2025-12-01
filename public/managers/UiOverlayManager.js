import { UIOverlay } from "../components/UiOverlay.js";


export class UIOverlayManager {
  constructor({ context }) {
    this.context = context;
    this.overlay = new UIOverlay({
      id: 'global-overlay',
      context,
      layoutManager: context.uiStage.layoutManager,
      layoutRenderer: context.uiStage.layoutRenderer
    });

    // Attach overlay to stage once
    context.uiStage.overlayRoot = this.overlay;
  }

  showSuccess(message) {
    this.overlay.showMessage({
      text: message,
      color: '#000', // green
      duration: 3500,
      fontSize: 0.05
    });
  }

  showError(message) {
    this.overlay.showMessage({
      text: message,
      color: '#dc3545', // red
      duration: 3000,
      fontSize: 0.05
    });
  }
}