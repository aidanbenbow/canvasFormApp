import { UIElement } from '../components/UiElement.js';
import { UIInputBox } from '../components/inputBox.js';
import { UIButton } from '../components/button.js';
import { UIText } from '../components/text.js';

export class LoginPlugin extends UIElement {
  constructor({ layoutManager,layoutRenderer, eventBus, editorController, onLogin }) {
    super({ id: 'loginPanel', layoutManager, layoutRenderer });
    this.type = 'loginPlugin';
    this.eventBus = eventBus;
    this.editorController = editorController;
    this.onLogin = onLogin;

    // 🔹 Create children
    this.usernameBox = new UIInputBox({
      id: 'usernameInput',
      
      editorController,
      placeholder: 'Username'
    });

    this.passwordBox = new UIInputBox({
      id: 'passwordInput',
      
      editorController,
      placeholder: 'Password'
    });

    this.loginButton = new UIButton({
      id: 'loginButton',
      
      label: 'Login',
      onClick: () => this.tryLogin()
    });

    this.loginMessage = new UIText({
      id: 'loginMessage',
      
      text: 'Welcome, Please Log In',
    });

    // 🔹 Compose children
    this.addChild(this.usernameBox);
    this.addChild(this.passwordBox);
    this.addChild(this.loginButton);
    this.addChild(this.loginMessage);

    // 🔹 Layout zones
    layoutManager.place({ id: 'usernameInput', x: 10, y: 10, width: 200, height: 40 });
    layoutManager.place({ id: 'passwordInput', x: 10, y: 60, width: 200, height: 40 });
    layoutManager.place({ id: 'loginButton', x: 10, y: 110, width: 100, height: 40 });
    layoutManager.place({ id: 'loginMessage', x: 10, y: 180, width: 300, height: 30 });
  }

  // 🔹 Register hit zones
  registerHitRegions(hitRegistry) {
    hitRegistry.registerPluginHits(this, {
      usernameInput: 'input',
      passwordInput: 'input',
      loginButton: 'button',
      
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
    const username = this.usernameBox.text?.trim?.() || '';
    const password = this.passwordBox.text?.trim?.() || '';
    if (!username || !password) {
      this.eventBus.emit('socketFeedback', {
        text: 'Enter username and password',
        position: { x: 10, y: 100 },
        duration: 2000
      });
      return;
    }
    // Use socket.io to authenticate
    import('../socketClient.js').then(({ default: socket }) => {
      socket.emit('loginUser', { username, password });
      socket.once('loginUserResponse', (resp) => {
        if (resp.success && resp.token) {
          localStorage.setItem('sessionToken', resp.token);
          localStorage.setItem('username', username);
          this.onLogin();
        } else {
          this.eventBus.emit('socketFeedback', {
            text: resp.error || 'Login failed',
            position: { x: 10, y: 100 },
            duration: 2000
          });
        }
      });
    });
  }
}



