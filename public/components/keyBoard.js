import { dispatcher } from '../app.js';
import { ACTIONS } from '../events/actions.js';
import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';

export class PopupKeyboard extends UIElement {
  constructor({ layoutManager, layoutRenderer,context, editorController }) {
    super({ id: 'popupKeyboard',context, layoutManager, layoutRenderer });
    this.editorController = editorController;
    this.context = context;
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
    this.keyLayout.forEach((row, rowIndex) => {
      row.forEach((key, i) => {
        const button = new UIButton({ 
          id: `key-${rowIndex}-${i}-${key}`,
          label: key,
          color: '#28a74599',
          onClick: () => this.handleKeyPress(key),
          context: this.context,
          layoutManager: this.layoutManager,
          layoutRenderer: this.layoutRenderer
        });
        this.addChild(button);
      });
    });
  }

  handleKeyPress(key) {
   dispatcher.dispatch(ACTIONS.KEYBOARD.PRESS, { key });
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

  measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
    const logicalWidth = this.layoutManager.logicalWidth;
    const logicalHeight = this.layoutManager.logicalHeight;
  
    const keyWidth = logicalWidth * 0.05;
    const spacing = logicalHeight * 0.01;
    const maxKeyboardHeight = logicalHeight * 0.4;
    const rowCount = this.keyLayout.length;
    const keyHeight = Math.min(
      (maxKeyboardHeight - (rowCount - 1) * spacing) / rowCount,
      logicalHeight * 0.06
    );
  
    this.totalKeyboardHeight = rowCount * keyHeight + (rowCount - 1) * spacing;
  
    const width = Math.min(constraints.maxWidth, logicalWidth);
    const height = Math.min(constraints.maxHeight, this.totalKeyboardHeight);
  
    this._measured = { width, height };
    return this._measured;
  }
  

  layout(x, y, width, height) {
    const logicalWidth = this.layoutManager.logicalWidth;
    const logicalHeight = this.layoutManager.logicalHeight;
  
    const w = width || this._measured.width;
    const h = height || this._measured.height;
  
    this.bounds = { x, y, width: w, height: h };
  
    // Position keys row by row
    const keyWidth = logicalWidth * 0.05;
    const spacing = logicalHeight * 0.01;
    const rowCount = this.keyLayout.length;
    const keyHeight = Math.min(
      (logicalHeight * 0.4 - (rowCount - 1) * spacing) / rowCount,
      logicalHeight * 0.06
    );
  
    const startY = y; // anchor at provided y
    const startX = this.bounds.x + 50;

    this.keyLayout.forEach((row, rowIndex) => {
      const rowY = startY + rowIndex * (keyHeight + spacing);
      row.forEach((key, i) => {
        const child = this.children.find(c => c.label === key);
        if (child) {
          const childSize = child.measure({ maxWidth: keyWidth, maxHeight: keyHeight });
child.layout(startX + i * (keyWidth + spacing), rowY, childSize.width, childSize.height);
        }
      });
    });
  }
  
}
