export class ScreenRouter {
  constructor({ context, uiEngine, screenRegistry }) {
    this.context = context;
    this.uiEngine = uiEngine;
    this.screenRegistry = screenRegistry;

    this.currentScreen = null;
    this.screenStack = [];

    this.lock = false;
  }

  // --------------------------------------------------
  // Screen Factory
  // --------------------------------------------------

  createScreen(name, params = {}) {
    const ScreenClass = this.screenRegistry.get(name);

    if (!ScreenClass) {
      console.warn(`[Router] Unknown screen: ${name}`);
      return null;
    }

    return new ScreenClass({
      context: this.context,
      ...params
    });
  }

  // --------------------------------------------------
  // Navigation Core
  // --------------------------------------------------

  replace(name, params = {}) {
    if (this.lock) return;

    this.lock = true;

    try {
      const screen = this.createScreen(name, params);
      if (!screen) return;

      this.currentScreen?.onExit?.();

      screen.createRoot?.();

      this.currentScreen = screen;

      this.uiEngine.mountScene(screen.rootNode);

      screen.onEnter?.();

      this.context.pipeline.invalidate();
    } finally {
      this.lock = false;
    }
  }

  push(name, params = {}) {
    if (this.lock) return;

    this.lock = true;

    try {
      const screen = this.createScreen(name, params);
      if (!screen) return;

      if (this.currentScreen) {
        this.currentScreen.onExit?.();
        this.screenStack.push(this.currentScreen);
      }

      screen.createRoot?.();

      this.currentScreen = screen;

      this.uiEngine.mountScene(screen.rootNode);

      screen.onEnter?.();

      this.context.pipeline.invalidate();
    } finally {
      this.lock = false;
    }
  }

  pop() {
    if (this.lock) return;

    this.lock = true;

    try {
      this.currentScreen?.onExit?.();

      this.currentScreen = this.screenStack.pop();

      if (!this.currentScreen) return;

      this.currentScreen.createRoot?.();

      this.uiEngine.mountScene(this.currentScreen.rootNode);

      this.currentScreen.onEnter?.();

      this.context.pipeline.invalidate();
    } finally {
      this.lock = false;
    }
  }

  // --------------------------------------------------
  // Utility
  // --------------------------------------------------

  getCurrentScreen() {
    return this.currentScreen;
  }
}