export class ScreenRouter {
    constructor({ context, stage }) {
      this.context = context;
      this.stage = stage;
      this.currentScreen = null;
      this.screenStack = [];
    }
  
    // Replace current screen with a new one
    replace(screen) {
      if (this.currentScreen) {
        this.currentScreen.detachFromStage(this.stage);
      }
      this.currentScreen = screen;
      screen.attachToStage(this.stage);
      this.context.pipeline.invalidate();
    }
  
    // Push a new screen on top of stack
    push(screen) {
      if (this.currentScreen) {
        this.screenStack.push(this.currentScreen);
        this.currentScreen.detachFromStage(this.stage);
      }
      this.currentScreen = screen;
      screen.attachToStage(this.stage);
      this.context.pipeline.invalidate();
    }
  
    // Pop back to previous screen
    pop() {
      if (this.currentScreen) {
        this.currentScreen.detachFromStage(this.stage);
      }
      this.currentScreen = this.screenStack.pop();
      if (this.currentScreen) {
        this.currentScreen.attachToStage(this.stage);
        this.context.pipeline.invalidate();
      }
    }
  }