
  export class ScreenRouter {
    constructor({ context, uiEngine }) {
      this.context = context;
      this.uiEngine = uiEngine;
  
      this.currentScreen = null;
      this.screenStack = [];
    }
  
    replace(screen) {
      console.log("Replacing screen:", screen.id);
      if (this.currentScreen) {
        this.currentScreen.onExit?.();
      }
  screen.createRoot();
      this.currentScreen = screen;
      this.uiEngine.mountScene(screen.rootNode);
      screen.onEnter?.();
      this.context.pipeline.invalidate();
    }
  
    push(screen) {
      console.log("Pushing screen:", screen.id);
      if (this.currentScreen) {
        this.currentScreen.onExit?.();
        this.screenStack.push(this.currentScreen);
      }
      screen.createRoot();
      this.currentScreen = screen;
      this.uiEngine.mountScene(screen.rootNode);
      screen.onEnter?.();
  this.context.pipeline.invalidate();
    }
  
    pop() {
      if (this.currentScreen) {
        this.currentScreen.onExit?.();
      }
  
      this.currentScreen = this.screenStack.pop();
      if (this.currentScreen) {
        this.currentScreen.createRoot?.();
        this.uiEngine.mountScene(this.currentScreen.rootNode);
        this.currentScreen.onEnter?.();
        
      }
    }
  }
  