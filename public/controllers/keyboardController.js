import { PopupKeyboard } from "../components/keyBoard.js";

export class keyboardController {
  constructor(pipeline,layoutManager, layoutRenderer,uiStage) {
   this.pipeline = pipeline;
    this.layoutManager = layoutManager;
    this.layoutRenderer = layoutRenderer;
    this.uiStage = uiStage;
this.activeBox = null;
    this.keyboard = null;
  }
   
  showKeyboard(box, field) {
    if(this.keyboard) {
      this.hideKeyboard();
    }
    this.activeBox = box;
    this.keyboard = new PopupKeyboard({
      id: 'popup-keyboard',
      layoutManager: this.layoutManager,
      layoutRenderer: this.layoutRenderer,
     context: this.pipeline.rendererContext,
    });

    if(this.uiStage.activeRoot) {
      this.uiStage.activeRoot.addChild(this.keyboard);
    }

    this.positionKeyboard();
    this.pipeline.invalidate();
  }
  hideKeyboard() {
    if(this.keyboard&& this.uiStage.activeRoot) {
      this.uiStage.activeRoot.removeChild(this.keyboard);
      this.keyboard = null;
      this.pipeline.invalidate();
    }
  }
  positionKeyboard() {
    if(!this.keyboard) return;
    const bounds = this.layoutManager.getLogicalBounds(this.activeBox.id);
    if(!bounds) return;
    const spacing = 0.02; // logical units
    const keyboardHeight = 0.3; // logical units
    const keyboardWidth = 0.6; // logical units
    let keyboardX = bounds.x;
    let keyboardY = bounds.y + bounds.height + spacing;
    // Check if keyboard goes beyond right edge
    if(keyboardX + keyboardWidth > 1) {
      keyboardX = 1 - keyboardWidth - spacing;
    }
    // Check if keyboard goes beyond bottom edge
    if(keyboardY + keyboardHeight > 1) {
      keyboardY = bounds.y - keyboardHeight - spacing;
    }
    this.layoutManager.place({
      id: this.keyboard.id,
      x: keyboardX,
      y: keyboardY,
      width: keyboardWidth,
      height: keyboardHeight
    });
  }

}