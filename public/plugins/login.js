import { utilsRegister } from "../utils/register.js";

export class LoginPlugin {
  constructor({ ctx, onLogin, eventBus, editorController, layoutManager }) {
    this.ctx = ctx;
    this.canvasWidth = this.ctx.canvas.width;
    this.canvasHeight = this.ctx.canvas.height;
    
    this.onLogin = onLogin;
    this.bounds = { x: 10, y: 10, width: 100, height: 40 };
    this.type = 'loginPlugin';
    this.eventBus = eventBus;
    this.editorController = editorController;
    this.layoutManager = layoutManager;

    layoutManager.place({
      id: 'loginButton',
      x: 10,
      y: 10,
      width: 100,
      height: 40
    });
  
    layoutManager.place({
      id: 'loginInput',
      x: 10,
      y: 60,
      width: 200,
      height: 40
    });
  
    this.inputBox = {
      id: 'loginInput',
      text: '',
      updateText: (newText) => {
        this.inputBox.text = newText;
      }
    };

  }

  render({ ctx }) {
    this.draw(ctx);
  }

    draw(ctx) {
const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
const loginBounds = this.layoutManager.getScaledBounds('loginButton', this.canvasWidth, this.canvasHeight);
const inputBounds = this.layoutManager.getScaledBounds('loginInput', this.canvasWidth, this.canvasHeight);

ctx.fillStyle = 'blue';
  ctx.fillRect(loginBounds.x, loginBounds.y, loginBounds.width, loginBounds.height);
  ctx.fillStyle = 'white';
  ctx.font = getLogicalFontSize(16, this.canvasHeight);
  ctx.fillText('Admin Login', loginBounds.x + 10, loginBounds.y + 25);

  ctx.fillStyle = '#fff';
  ctx.fillRect(inputBounds.x, inputBounds.y, inputBounds.width, inputBounds.height);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(inputBounds.x, inputBounds.y, inputBounds.width, inputBounds.height);
  ctx.fillStyle = '#000';
  ctx.fillText(this.inputBox.text, inputBounds.x + 10, inputBounds.y + 25);
}
    
handleClick(x, y) {
const loginBounds = this.layoutManager.getScaledBounds('loginButton', this.canvasWidth, this.canvasHeight);
const inputBounds = this.layoutManager.getScaledBounds('loginInput', this.canvasWidth, this.canvasHeight);

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

  const withinInput =
    x >= inputBounds.x &&
    x <= inputBounds.x + inputBounds.width &&
    y >= inputBounds.y &&
    y <= inputBounds.y + inputBounds.height;

  if (withinInput) {
    this.editorController.startEditing(this.inputBox, 'text');
  
  }
}

    getHitHex() {
      return 'login-001';
    }
  
    getHitColor() {
      return '#ff0002';
    }
  
    registerHitRegion(hitRegistry) {
      hitRegistry.register('loginButton', {
        type: 'loginButton',
        plugin: this,
       bounds: this.layoutManager.getScaledBounds('loginButton', this.canvasWidth, this.canvasHeight),
        region: 'button'
      });
      
      hitRegistry.register('loginInput', {
        type: 'loginPlugin',
        plugin: this,
       bounds: this.layoutManager.getScaledBounds('loginInput', this.canvasWidth, this.canvasHeight),
        region: 'input'
      });
      
    }
    
  }