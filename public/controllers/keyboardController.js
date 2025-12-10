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
    
    const constraints = {
      maxWidth: this.layoutManager.logicalWidth,
      maxHeight: this.layoutManager.logicalHeight
    };
    const measured = this.keyboard.measure(constraints);
    
    // Position relative to active box
    const bounds = this.activeBox.bounds; // safer than layoutManager.getLogicalBounds
    if (!bounds) {
      console.warn("Active box has no bounds yet");
      return;
    }
    
    let keyboardX = (this.layoutManager.logicalWidth - measured.width) / 2;
    let keyboardY = bounds.y + bounds.height + 20;
    
    if (keyboardY + measured.height > this.layoutManager.logicalHeight) {
      keyboardY = bounds.y - measured.height - 20;
    }
    
    this.keyboard.layout(keyboardX, keyboardY, measured.width, measured.height);
    
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
    if (!this.keyboard) return;
    const bounds = this.layoutManager.getLogicalBounds(this.activeBox.id);
    if (!bounds) return;
    console.log('Keyboard positioned at:', keyboardX, keyboardY);
    const spacing = 0.02; // logical units
    const constraints = {
      maxWidth: this.layoutManager.logicalWidth,
      maxHeight: this.layoutManager.logicalHeight
    };
  
    // 🔹 Let the keyboard measure itself
    const measured = this.keyboard.measure(constraints);
  
    // Place below the active box
    let keyboardX = (this.layoutManager.logicalWidth - measured.width) / 2;
    let keyboardY = bounds.y + bounds.height + spacing;
  
    // Clamp to bottom edge
    if (keyboardY + measured.height > this.layoutManager.logicalHeight) {
      keyboardY = bounds.y - measured.height - spacing;
    }
  
    // 🔹 Call the keyboard’s own layout
    this.keyboard.layout(keyboardX, keyboardY, measured.width, measured.height);

  
  }

}