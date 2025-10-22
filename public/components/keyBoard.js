import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';

export class PopupKeyboard extends UIElement {
  constructor({ layoutManager, layoutRenderer, editorController }) {
    super({ id: 'popupKeyboard', layoutManager, layoutRenderer });
    this.editorController = editorController;
    this.type = 'popupKeyboard';
    this.layout = [
      ['Q','W','E','R','T','Y','U','i','O','P'],
      ['a','S','d','F','G','H','J','K','L'],
      ['Z','X','C','V','B','n','m'],
      ['←','Space','↵']
    ];
    this.createKeys();
  }

  createKeys() {
    const keyHeight = this.layoutManager.logicalHeight * 0.06;
    const keyWidth = this.layoutManager.logicalWidth * 0.05;
    const spacing = this.layoutManager.logicalWidth * 0.01;
    const logicalHeight = this.layoutManager.logicalHeight;
    const keyboardHeight = logicalHeight * 0.3; // 30% of canvas height
    const startY = logicalHeight - keyboardHeight - spacing; // anchor near bottom
    
  
    this.layout.forEach((row, rowIndex) => {
      const y = startY + rowIndex * (keyHeight + spacing);
      const ids = row.map((key, i) => `key-${rowIndex}-${i}-${key}`);
  
      // Place keys using flow
      this.layoutManager.flow({
        direction: 'horizontal',
        items: ids,
        spacing,
        anchor: 'top-left',
        start: { x: 50, y },
        size: { width: keyWidth, height: keyHeight }
      });
  
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
    this.layoutRenderer.drawRect(this.id, {
      stroke: 'red',
      lineWidth: 1
    });
    super.render();
  }
}
