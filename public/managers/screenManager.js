export class ScreenManager {
    constructor(engineRoot) {
      this.engineRoot = engineRoot;
      this.currentScreen = null;
    }
  
    loadScreen(screenRoot) {
      if (this.currentScreen) {
        this.engineRoot.remove(this.currentScreen);
      }
  
      this.currentScreen = screenRoot;
      this.engineRoot.add(screenRoot);
    }
  }