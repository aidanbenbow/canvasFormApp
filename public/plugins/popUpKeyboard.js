import { utilsRegister } from "../utils/register.js";


export class PopupKeyboardPlugin {
    constructor({ ctx, editorController, layoutManager }) {
      this.type = 'popupKeyboard';
      this.ctx = ctx;
      this.editorController = editorController;
      this.layoutManager = layoutManager;
      const canvasWidth = this.ctx.canvas.width;
const canvasHeight = this.ctx.canvas.height;

 this.getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');

 const { width: logicalWidth, height: logicalHeight } = utilsRegister.get('layout', 'getLogicalDimensions')();
 const maxKeyboardHeight = logicalHeight * 0.35;
 const keyboardHeight = Math.min(maxKeyboardHeight, logicalHeight * 0.3);
 const keyboardY = logicalHeight - keyboardHeight - 10; // 10 units above bottom
 
 layoutManager.place({
   id: 'popupKeyboard',
   x: logicalWidth * 0.05,   // 5% from left
   y: keyboardY,
   width: logicalWidth * 0.9, // 90% width
   height: keyboardHeight,
   
 });
 
const bounds = layoutManager.getLogicalBounds('popupKeyboard');

const scaledBounds = layoutManager.getScaledBounds('popupKeyboard', canvasWidth, canvasHeight);
this.canvasPosition = { x: scaledBounds.x, y: scaledBounds.y };
console.log('PopupKeyboard logical bounds:', scaledBounds);

this.layout = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['a','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
  ['←','Space','↵']
];

this.rowWeights = this.layout.map(row =>
  row.reduce((acc, key) => {
    const multiplier = key === 'Space' ? 5 : key === '↵' ? 1.5 : 1;
    return acc + multiplier;
  }, 0)
);

const maxWeight = Math.max(...this.rowWeights);


this.size = { width: scaledBounds.width, height: scaledBounds.height };

this.spacing = 10;
this.keySize = {
 
  height: this.size.height / this.layout.length - this.spacing
};


    }
  
    render({ ctx }) {
      ctx.strokeStyle = 'red';
ctx.strokeRect(this.canvasPosition.x, this.canvasPosition.y, this.size.width, this.size.height);

      ctx.save();
      const fontSize = Math.min(this.keySize.height * 0.6, 24);
ctx.font = `${fontSize}px Arial`;


      ctx.fillStyle = '#ddd';
  
      let y = this.canvasPosition.y;

      this.keyBounds = [];
  
      this.layout.forEach((row, rowIndex) => {
        let x = this.canvasPosition.x;
        const rowWeight = this.rowWeights[rowIndex];
  const availableWidth = this.size.width - (row.length - 1) * this.spacing;
  const unitWidth = availableWidth / rowWeight;
  row.forEach((key) => {
    const multiplier = key === 'Space' ? 5 : key === '↵' ? 1.5 : 1;
    const w = unitWidth * multiplier;

    ctx.fillStyle = '#007bff';
    ctx.fillRect(x, y, w, this.keySize.height);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(key, x + 10, y + this.keySize.height / 2);

    this.keyBounds.push({ key, x, y, width: w, height: this.keySize.height });
    x += w + this.spacing;
  });

  y += this.keySize.height + this.spacing;
      });
  
      ctx.restore();
      
    }
  
    handleClick(x, y) {
   

        const hit = this.keyBounds.find(k =>
          x >= k.x && x <= k.x + k.width &&
          y >= k.y && y <= k.y + k.height
        );
      
        if (!hit) return;
      
        const key = hit.key;
      
        if (key === 'Space') {
          this.editorController.insertChar(' ');
          return;
        }
      
        if (key === '←') {
          this.editorController.deleteChar();
          return;
        }
      
        if (key === '↵') {
          const activeBox = this.editorController.activeBox;
          if (activeBox?.type === 'inputBox' && activeBox?.text) {
            system.eventBus.emit('loginAttempt', { password: activeBox.text });
          }
          return; // ✅ Prevent newline insertion
        }
        

        this.editorController.insertChar(key);
      }
      
    
  }
  