export class PopupKeyboardPlugin {
    constructor({ ctx, editorController, position = { x: 50, y: 300 } }) {
      this.type = 'popupKeyboard';
      this.ctx = ctx;
      this.editorController = editorController;
      this.position = position;
      this.keySize = { width: 40, height: 40 };
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
  
      let y = this.position.y;
      this.keyBounds = [];
  
      this.layout.forEach((row) => {
        let x = this.position.x;
        row.forEach((key) => {
          const w = key === 'Space' ? 200 : (key === '↵' ? 60 : this.keySize.width);
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
  