import { utilsRegister } from "../utils/register.js";

export class LoginPlugin {
  constructor({ ctx, onLogin, eventBus, editorController }) {
    this.ctx = ctx;
    this.canvasWidth = this.ctx.canvas.width;
    this.canvasHeight = this.ctx.canvas.height;
    
    this.onLogin = onLogin;
    this.bounds = { x: 10, y: 10, width: 100, height: 40 };
    this.type = 'loginPlugin';
    this.eventBus = eventBus;
    this.editorController = editorController;

    this.logicalBounds = { x: 10, y: 10, width: 100, height: 40 };
    this.logicalInputBox = {
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

      const scaleToCanvas = utilsRegister.get('layout', 'scaleToCanvas');
      const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
      const bounds = scaleToCanvas(this.logicalBounds, this.canvasWidth, this.canvasHeight);
  const inputBox = {
    ...this.logicalInputBox,
    startPosition: scaleToCanvas(this.logicalInputBox.startPosition, this.canvasWidth, this.canvasHeight),
    size: {
      width: (this.logicalInputBox.size.width / 1000) * this.canvasWidth,
      height: (this.logicalInputBox.size.height / 1000) * this.canvasHeight
    }
  };

  ctx.fillStyle = 'blue';
  ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.fillStyle = 'white';
  ctx.font = getLogicalFontSize(16, this.canvasHeight);
  ctx.fillText('Admin Login', bounds.x + 10, bounds.y + 25);

  ctx.fillStyle = '#fff';
  ctx.fillRect(inputBox.startPosition.x, inputBox.startPosition.y, inputBox.size.width, inputBox.size.height);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(inputBox.startPosition.x, inputBox.startPosition.y, inputBox.size.width, inputBox.size.height);
  ctx.fillStyle = '#000';
  ctx.fillText(inputBox.text, inputBox.startPosition.x + 10, inputBox.startPosition.y + 25);
}
    
handleClick(x, y) {

  const scaleToCanvas = utilsRegister.get('layout', 'scaleToCanvas');

  // 🔹 Scale login button bounds
  const loginBounds = scaleToCanvas(this.logicalBounds, this.canvasWidth, this.canvasHeight);

  const withinLogin =
    x >= loginBounds.x &&
    x <= loginBounds.x + loginBounds.width &&
    y >= loginBounds.y &&
    y <= loginBounds.y + loginBounds.height;

  if (withinLogin) {
    const password = this.inputBox.text.trim();
    if (password === 'aa') {
      this.onLogin();
    } else {
      this.eventBus.emit('socketFeedback', {
        text: 'Incorrect password ❌',
        position: { x: loginBounds.x, y: loginBounds.y + 50 },
        duration: 2000
      });
    }
    return;
  }

  // 🔹 Scale input box bounds
  const inputPos = scaleToCanvas(this.logicalInputBox.startPosition, this.canvasWidth, this.canvasHeight);
  const inputSize = {
    width: (this.logicalInputBox.size.width / 1000) * this.canvasWidth,
    height: (this.logicalInputBox.size.height / 1000) * this.canvasHeight
  };

  const withinInput =
    x >= inputPos.x &&
    x <= inputPos.x + inputSize.width &&
    y >= inputPos.y &&
    y <= inputPos.y + inputSize.height;

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