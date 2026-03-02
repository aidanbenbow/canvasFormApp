export class ScreenManager {
    constructor(engineRoot) {
      this.engineRoot = engineRoot;
      this.currentScreenRoot = null;
    }
  setContext(context) {
    this.context = context;
  }

    loadScreen(screenRoot) {
      if (this.currentScreenRoot) {
        this.engineRoot.remove(this.currentScreenRoot);
      }
  
      this.currentScreenRoot = screenRoot;
      this.engineRoot.add(screenRoot);
    }
  }