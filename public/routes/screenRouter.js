
  export class ScreenRouter {
    constructor({ context }) {
      this.context = context;
      this.pipeline = context.pipeline;
  
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
      this.pipeline.setRoot(screen.rootNode);
      screen.onEnter?.();
  
      this.pipeline.invalidate();
    }
  
    push(screen) {
      console.log("Pushing screen:", screen.id);
      if (this.currentScreen) {
        this.currentScreen.onExit?.();
        this.screenStack.push(this.currentScreen);
      }
      screen.createRoot();
      this.currentScreen = screen;
      this.pipeline.setRoot(screen.rootNode);
      screen.onEnter?.();
  
      this.pipeline.invalidate();
    }
  
    pop() {
      if (this.currentScreen) {
        this.currentScreen.onExit?.();
      }
  
      this.currentScreen = this.screenStack.pop();
      if (this.currentScreen) {
        this.currentScreen.createRoot?.();
        this.pipeline.setRoot(this.currentScreen.rootNode);
        this.currentScreen.onEnter?.();
        this.pipeline.invalidate();
      }
    }
  }
  