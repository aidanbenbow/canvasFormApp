export class LoginPlugin {
  constructor({ ctx, onLogin, eventBus, editorController }) {
    this.ctx = ctx;
    this.onLogin = onLogin;
    this.bounds = { x: 10, y: 10, width: 100, height: 40 };
    this.type = 'loginPlugin';
    this.eventBus = eventBus;
    this.textEditorController = editorController;

    this.inputBox = {
      text: '',
      startPosition: { x: 10, y: 60 },
      size: { width: 200, height: 40 },
      updateText: (newText) => {
        this.inputBox.text = newText;
      }
    };
  }

  render({ ctx }) {
    this.draw(ctx);
  }

    draw(ctx) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
      ctx.fillStyle = 'white';
      ctx.fillText('Admin Login', this.bounds.x + 10, this.bounds.y + 25);

      // Input box
  ctx.fillStyle = '#fff';
  ctx.fillRect(this.inputBox.startPosition.x, this.inputBox.startPosition.y, this.inputBox.size.width, this.inputBox.size.height);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(this.inputBox.startPosition.x, this.inputBox.startPosition.y, this.inputBox.size.width, this.inputBox.size.height);
  ctx.fillStyle = '#000';
  ctx.fillText(this.inputBox.text, this.inputBox.startPosition.x + 10, this.inputBox.startPosition.y + 25);
}
    
  
    handleClick(x, y) {
      const withinLogin =
    x >= this.bounds.x &&
    x <= this.bounds.x + this.bounds.width &&
    y >= this.bounds.y &&
    y <= this.bounds.y + this.bounds.height;

  if (withinLogin) {
    const password = this.inputBox.text.trim();
    if (password === 'aa') {
      this.onLogin();
    } else {
      this.eventBus.emit('socketFeedback', {
        text: 'Incorrect password ❌',
        position: { x: this.bounds.x, y: this.bounds.y + 50 },
        duration: 2000
      });
    }
    return;
  }

  const withinInput =
    x >= this.inputBox.startPosition.x &&
    x <= this.inputBox.startPosition.x + this.inputBox.size.width &&
    y >= this.inputBox.startPosition.y &&
    y <= this.inputBox.startPosition.y + this.inputBox.size.height;
console.log('withinInput', withinInput);
  if (withinInput) {
    this.editorController.startEditing(this.inputBox, 'text');
    this.eventBus.emit('showKeyboard', { box: this.inputBox, field: 'text' });
  }
}
    getHitHex() {
      return 'login-001';
    }
  
    getHitColor() {
      return '#ff0002';
    }
  
    registerHitRegion(hitRegistry) {
      hitRegistry.register(this.getHitHex(), {
        type: this.type,
        plugin: this,
        bounds: this.bounds
      });
      hitRegistry.register('login-input', {
        type: this.type,
        plugin: this,
        bounds: {
          x: this.inputBox.startPosition.x,
          y: this.inputBox.startPosition.y,
          width: this.inputBox.size.width,
          height: this.inputBox.size.height
        }
      });
    }
  
    drawHitRegion(hitCtx) {
      hitCtx.fillStyle = this.getHitColor();
      hitCtx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
      hitCtx.fillRect(
        this.inputBox.startPosition.x,
        this.inputBox.startPosition.y,
        this.inputBox.size.width,
        this.inputBox.size.height
      );
    }
    getHitRegions() {
      return [
        {
          hex: this.getHitHex(),
          bounds: this.bounds
        },
        {
          hex: 'login-input',
          bounds: {
            x: this.inputBox.startPosition.x,
            y: this.inputBox.startPosition.y,
            width: this.inputBox.size.width,
            height: this.inputBox.size.height
          }
        }
      ];
    }
    
  }