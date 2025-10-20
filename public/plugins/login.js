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

    this.layoutManager.place({
      id: 'usernameInput',
      x: 10,
      y: 10,
      width: 200,
      height: 40
    });
    
    this.layoutManager.place({
      id: 'passwordInput',
      x: 10,
      y: 60,
      width: 200,
      height: 40
    });
    
    this.layoutManager.place({
      id: 'loginButton',
      x: 10,
      y: 110,
      width: 100,
      height: 40
    });
    this.usernameBox = {
      id: 'usernameInput',
      text: '',
      updateText: (newText) => {
        this.usernameBox.text = newText;
      }
    };
    
    this.passwordBox = {
      id: 'passwordInput',
      text: '',
      updateText: (newText) => {
        this.passwordBox.text = newText;
      }
    };
    

  }

  render({ ctx }) {
    this.draw(ctx);
  }

    draw(ctx) {
const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
const usernameBounds = this.layoutManager.getScaledBounds('usernameInput', this.canvasWidth, this.canvasHeight);
const passwordBounds = this.layoutManager.getScaledBounds('passwordInput', this.canvasWidth, this.canvasHeight);
const loginBounds = this.layoutManager.getScaledBounds('loginButton', this.canvasWidth, this.canvasHeight);

ctx.font = getLogicalFontSize(16, this.canvasHeight);
// Username input
ctx.fillStyle = '#fff';
ctx.fillRect(usernameBounds.x, usernameBounds.y, usernameBounds.width, usernameBounds.height);
ctx.strokeStyle = '#000';
ctx.strokeRect(usernameBounds.x, usernameBounds.y, usernameBounds.width, usernameBounds.height);
ctx.fillStyle = '#000';
ctx.fillText(this.usernameBox.text, usernameBounds.x + 10, usernameBounds.y + 25);

// Password input
ctx.fillStyle = '#fff';
ctx.fillRect(passwordBounds.x, passwordBounds.y, passwordBounds.width, passwordBounds.height);
ctx.strokeStyle = '#000';
ctx.strokeRect(passwordBounds.x, passwordBounds.y, passwordBounds.width, passwordBounds.height);
ctx.fillStyle = '#000';
ctx.fillText(this.passwordBox.text, passwordBounds.x + 10, passwordBounds.y + 25);

// Login button
ctx.fillStyle = 'blue';
ctx.fillRect(loginBounds.x, loginBounds.y, loginBounds.width, loginBounds.height);
ctx.fillStyle = 'white';
ctx.fillText('Login', loginBounds.x + 10, loginBounds.y + 25);
}
    
handleClick(x, y) {
  const usernameBounds = this.layoutManager.getScaledBounds('usernameInput', this.canvasWidth, this.canvasHeight);
  const passwordBounds = this.layoutManager.getScaledBounds('passwordInput', this.canvasWidth, this.canvasHeight);
  const loginBounds = this.layoutManager.getScaledBounds('loginButton', this.canvasWidth, this.canvasHeight);
  console.log('LoginPlugin handleClick at', x, y);
  console.log('LoginPlugin bounds:', { usernameBounds, passwordBounds, loginBounds });
  if (x >= loginBounds.x && x <= loginBounds.x + loginBounds.width &&
      y >= loginBounds.y && y <= loginBounds.y + loginBounds.height) {
    const username = this.usernameBox.text.trim();
    const password = this.passwordBox.text.trim();
  
    if (username === 'admin' && password === 'aa') {
      this.onLogin();
     
    } else {
      this.eventBus.emit('socketFeedback', {
        text: 'Incorrect credentials ❌',
        position: { x: loginBounds.x, y: loginBounds.y + 50 },
        duration: 2000
      });
    }
    return;
  }
  
  if (x >= usernameBounds.x && x <= usernameBounds.x + usernameBounds.width &&
      y >= usernameBounds.y && y <= usernameBounds.y + usernameBounds.height) {
    this.editorController.startEditing(this.usernameBox, 'text');
    return;
  }
  
  if (x >= passwordBounds.x && x <= passwordBounds.x + passwordBounds.width &&
      y >= passwordBounds.y && y <= passwordBounds.y + passwordBounds.height) {
    this.editorController.startEditing(this.passwordBox, 'text');
    return;
  }
  
}

    getHitHex() {
      return 'login-001';
    }
  
    getHitColor() {
      return '#ff0002';
    }
  
    registerHitRegion(hitRegistry) {
      hitRegistry.register('usernameInput', {
        type: 'loginPlugin',
        plugin: this,
        bounds: this.layoutManager.getScaledBounds('usernameInput', this.canvasWidth, this.canvasHeight),
        region: 'input'
      });
      
      hitRegistry.register('passwordInput', {
        type: 'loginPlugin',
        plugin: this,
        bounds: this.layoutManager.getScaledBounds('passwordInput', this.canvasWidth, this.canvasHeight),
        region: 'input'
      });
      
      hitRegistry.register('loginButton', {
        type: 'loginPlugin',
        plugin: this,
        bounds: this.layoutManager.getScaledBounds('loginButton', this.canvasWidth, this.canvasHeight),
        region: 'button'
      });
      
    }
    
  }