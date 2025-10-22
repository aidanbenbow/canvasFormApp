import { UIElement } from '../components/UiElement.js';
import { UIInputBox } from '../components/inputBox.js';
import { UIButton } from '../components/button.js';

export class LoginPlugin extends UIElement {
  constructor({ layoutManager, layoutRenderer, eventBus, editorController, onLogin }) {
    super({ id: 'loginPanel', layoutManager, layoutRenderer });
    this.type = 'loginPlugin';
    this.eventBus = eventBus;
    this.editorController = editorController;
    this.onLogin = onLogin;

    // 🔹 Create children
    this.usernameBox = new UIInputBox({
      id: 'usernameInput',
      layoutManager,
      layoutRenderer,
      editorController,
      placeholder: 'Username'
    });

    this.passwordBox = new UIInputBox({
      id: 'passwordInput',
      layoutManager,
      layoutRenderer,
      editorController,
      placeholder: 'Password'
    });

    this.loginButton = new UIButton({
      id: 'loginButton',
      layoutManager,
      layoutRenderer,
      label: 'Login',
      onClick: () => this.tryLogin()
    });

    // 🔹 Compose children
    this.addChild(this.usernameBox);
    this.addChild(this.passwordBox);
    this.addChild(this.loginButton);

    // 🔹 Layout zones
    layoutManager.place({ id: 'usernameInput', x: 10, y: 10, width: 200, height: 40 });
    layoutManager.place({ id: 'passwordInput', x: 10, y: 60, width: 200, height: 40 });
    layoutManager.place({ id: 'loginButton', x: 10, y: 110, width: 100, height: 40 });
  }

  // 🔹 Register hit zones
  registerHitRegions(hitRegistry) {
    hitRegistry.registerPluginHits(this, {
      usernameInput: 'input',
      passwordInput: 'input',
      loginButton: 'button'
    });
  }

  // 🔹 Handle child events (bubble phase)
  onChildEvent(event, child) {
    if (event.type === 'click' && child === this.loginButton) {
      this.tryLogin();
      return true;
    }
    return false;
  }

  // 🔹 Login logic
  tryLogin() {
    const username = this.editorController.activeBox?.text?.trim?.() || '';
    const password = this.passwordBox.text?.trim?.() || '';
console.log('Attempting login with', { username, password });
    if (username === 'a' && password === 'aa') {
      this.onLogin();
    } else {
      const canvas = this.layoutRenderer.canvas;
const bounds = this.layoutManager.getScaledBounds('loginButton', canvas.width, canvas.height);

      this.eventBus.emit('socketFeedback', {
        text: 'Incorrect credentials ❌',
        position: { x: bounds.x, y: bounds.y + 50 },
        duration: 2000
      });
    }
  }
}




// import { UIInputBox } from '../components/inputBox.js';
// import { UIButton } from '../components/button.js';
// import { utilsRegister } from '../utils/register.js';

// export class LoginPlugin {
//   constructor({ layoutManager, layoutRenderer, eventBus, editorController, onLogin }) {
//     this.layoutManager = layoutManager;
//     this.renderer = layoutRenderer;
//     this.eventBus = eventBus;
//     this.editorController = editorController;
//     this.onLogin = onLogin;
// this.type = 'uiInputBox';
//     this.usernameBox = new UIInputBox({
//       id: 'usernameInput',
//       layoutManager,
//       layoutRenderer,
//       placeholder: 'Username'
//     });

//     this.passwordBox = new UIInputBox({
//       id: 'passwordInput',
//       layoutManager,
//       layoutRenderer,
//       placeholder: 'Password'
//     });

//     this.loginButton = new UIButton({
//       id: 'loginButton',
//       layoutManager,
//       layoutRenderer,
//       label: 'Login',
//       onClick: () => this.tryLogin()
//     });

//     layoutManager.place({ id: 'usernameInput', x: 10, y: 10, width: 200, height: 40 });
//     layoutManager.place({ id: 'passwordInput', x: 10, y: 60, width: 200, height: 40 });
//     layoutManager.place({ id: 'loginButton', x: 10, y: 110, width: 100, height: 40 });
//   }

//   render() {
//     this.usernameBox.render();
//     this.passwordBox.render();
//     this.loginButton.render();
//   }

//   registerHitRegions(hitRegistry) {
//     hitRegistry.registerPluginHits(this, {
//       usernameInput: 'input',
//       passwordInput: 'input',
//       loginButton: 'button'
//     });
    
//   }
  

//   handleClick(x, y) {
//     if (this.loginButton.contains(x, y)) {
//       this.loginButton.onClick();
//       return;
//     }
//     if (this.usernameBox.contains(x, y)) {
//       this.editorController.startEditing(this.usernameBox, 'value');
//       return;
//     }
//     if (this.passwordBox.contains(x, y)) {
//       this.editorController.startEditing(this.passwordBox, 'value');
//       return;
//     }
//   }

//   tryLogin() {
//     const username = this.usernameBox.value.trim();
//     const password = this.passwordBox.value.trim();

//     if (username === 'admin' && password === 'aa') {
//       this.onLogin();
//     } else {
//       const bounds = this.layoutManager.getBounds('loginButton');
//       this.eventBus.emit('socketFeedback', {
//         text: 'Incorrect credentials ❌',
//         position: { x: bounds.x, y: bounds.y + 50 },
//         duration: 2000
//       });
//     }
//   }
// }
