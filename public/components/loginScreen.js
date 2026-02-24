import { BaseScreen } from './baseScreen.js';
import { compileUIManifest } from './uiManifestCompiler.js';
import { defineManifest, containerRegion, inputNode, buttonNode, textNode } from './manifests/manifestDsl.js';
import socket from '../socketClient.js';

const loginManifest = defineManifest({
  layout: 'vertical',
  id: 'login-root',
  style: { background: '#f8fafc', align: 'center', paddingY: 60 },
  commands: {
    LOGIN: { action: 'LOGIN_ATTEMPT', needsActive: false }
  },
  regions: {
    title: containerRegion({ children: [textNode({ id: 'login-title', text: 'Login', style: { font: '32px sans-serif', color: '#222', marginBottom: 24 } })] }),
    username: containerRegion({ children: [inputNode({ id: 'login-username', placeholder: 'Username', style: { width: 240, marginBottom: 16 } })] }),
    password: containerRegion({ children: [inputNode({ id: 'login-password', placeholder: 'Password', inputType: 'password', style: { width: 240, marginBottom: 24 } })] }),
    loginBtn: containerRegion({ children: [buttonNode({ id: 'login-btn', label: 'Login', action: 'LOGIN', style: { font: '20px sans-serif', fillWidth: true } })] }),
    message: containerRegion({ children: [textNode({ id: 'login-message', text: '', style: { color: '#b91c1c', marginTop: 16 } })] })
  }
});

export class LoginScreen extends BaseScreen {
  constructor({ context, dispatcher }) {
    super({ id: 'login', context, dispatcher });
    this.manifest = structuredClone(loginManifest);
  }


  createRoot() {
    const { rootNode, regions } = compileUIManifest(
      this.manifest,
      this.context.factories,
      this.context.commandRegistry,
      this.context
    );
    this.regions = regions;
    this.rootNode = rootNode;
    return rootNode;
  }

  showError(msg) {
    this.regions.message.setText(msg);
  }
}
