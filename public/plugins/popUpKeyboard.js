import { utilsRegister } from "../utils/register.js";


export class PopupKeyboardPlugin {
    constructor({ ctx, editorController, position = { x: 50, y: 300 } }) {
      this.type = 'popupKeyboard';
      this.ctx = ctx;
      this.editorController = editorController;
      
      const getLogicalDimensions = utilsRegister.get('layout', 'getLogicalDimensions');
const { width: logicalWidth, height: logicalHeight } = getLogicalDimensions();

this.position = {
  x: logicalWidth * 0.1,  // 10% from left
  y: logicalHeight * 0.7  // 70% down the screen
};

const scaleToCanvas = utilsRegister.get('layout', 'scaleToCanvas');
const getCanvasSize = utilsRegister.get('canvas', 'getCanvasSize');
const { width: canvasWidth, height: canvasHeight } = getCanvasSize();

this.canvasPosition = scaleToCanvas(this.position, canvasWidth, canvasHeight);

this.keySize = {
  width: canvasWidth * 0.04,
  height: canvasHeight * 0.06
};


      this.layout = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['a','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M'],
        ['←','Space','↵']
      ];
    }
  
    render({ ctx }) {
      ctx.save();
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ddd';
  
      let y = this.canvasPosition.y;

      this.keyBounds = [];
  
      this.layout.forEach((row) => {
        let x = this.position.x;
        row.forEach((key) => {
          const w = key === 'Space'
          ? this.keySize.width * 5
          : key === '↵'
          ? this.keySize.width * 1.5
          : this.keySize.width;
        
          ctx.fillStyle = '#007bff';
          ctx.fillRect(x, y, w, this.keySize.height);
          ctx.fillStyle = '#fff';
          ctx.fillText(key, x + 10, y + 25);
  
          this.keyBounds.push({ key, x, y, width: w, height: this.keySize.height });
          x += w + 10;
        });
        y += this.keySize.height + 10;
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
  