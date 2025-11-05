import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';

export class PopupKeyboard extends UIElement {
  constructor({ layoutManager, layoutRenderer, editorController }) {
    super({ id: 'popupKeyboard', layoutManager, layoutRenderer });
    this.editorController = editorController;
    this.type = 'popupKeyboard';
    this.keyLayout = [
      ['Q','W','E','R','T','Y','U','i','O','P'],
      ['a','S','d','F','G','H','J','K','L'],
      ['Z','X','C','V','B','n','m'],
      ['←','Space','↵']
    ];
    this.totalKeyboardHeight = 0;
    this.createKeys();
  }

  createKeys() {
    
    const keyWidth = this.layoutManager.logicalWidth * 0.05;
    const spacing = this.layoutManager.logicalHeight * 0.01;
    const logicalHeight = this.layoutManager.logicalHeight;
    const maxKeyboardHeight = logicalHeight * 0.4;
    const rowCount = this.keyLayout.length;
    const keyHeight = Math.min((maxKeyboardHeight - (rowCount - 1) * spacing) / rowCount, logicalHeight * 0.06);
    this.totalKeyboardHeight = rowCount * keyHeight + (rowCount - 1) * spacing;

    const startY = logicalHeight /2 // anchor near bottom
   
    this.keyLayout.forEach((row, rowIndex) => {
      const y = startY + rowIndex * (keyHeight + spacing);
      const ids = row.map((key, i) => `key-${rowIndex}-${i}-${key}`);
  
      // Create UIButton instances
      row.forEach((key, i) => {
        const id = ids[i];
        const button = new UIButton({
          id,
          label: key,
          layoutManager: this.layoutManager,
          layoutRenderer: this.layoutRenderer,
          onClick: () => this.handleKeyPress(key)
        });
        this.addChild(button);
      });

   
      // Place keys using flow
      this.layoutManager.flow({
        direction: 'horizontal',
        items: ids,
        spacing,
        anchor: 'top-left',
        start: { x: 50, y },
        size: { width: keyWidth, height: keyHeight }
      });
     

    });

  }
  

  handleKeyPress(key) {
    const ec = this.editorController;
    if (key === 'Space') ec.insertChar(' ');
    else if (key === '←') ec.deleteChar();
    else if (key === '↵') system.eventBus.emit('submit');
    else ec.insertChar(key);
  }

  render() {
  
    super.render();
    
  }
  dispatchEvent(event) {
    // Always check children, even if parent isn't hit
    for (const child of this.children) {
      if (child.dispatchEvent(event)) return true;
    }
    return false;
  }
  

  layout(canvasWidth, canvasHeight) {
    const logicalWidth = this.layoutManager.logicalWidth;
    const logicalHeight = this.layoutManager.logicalHeight;
  
    const desiredWidth = logicalWidth * 0.9;
    const desiredHeight = logicalHeight * 0.4;
    const desiredX = logicalWidth * 0.05;
    const desiredY = logicalHeight * 0.55; // anchor near bottom
  
    this.layoutManager.place({
      id: this.id,
      x: 0,
      y: logicalHeight/4,
      width: logicalWidth,
      height: this.totalKeyboardHeight
    });
  
    super.layout(canvasWidth, canvasHeight); // ✅ layout children (buttons)
   // this.layoutManager.dumpRegistry(); // For debugging
  }
  
}
