export class ScreenManager {
    constructor(engineRoot) {
      this.engineRoot = engineRoot;
      this.currentScreenRoot = null;
    }
  
    loadScreen(screenRoot) {
      if (this.currentScreenRoot) {
        this.engineRoot.remove(this.currentScreenRoot);
      }
  
      this.currentScreenRoot = screenRoot;
      this.engineRoot.add(screenRoot);
    }
  }