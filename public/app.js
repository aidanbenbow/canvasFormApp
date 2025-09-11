import { canvasConfig, createPluginManifest } from "./constants.js";
import { TextEditorController } from "./controllers/textEditor.js";
import { CanvasManager } from "./managers/canvas.js";
import { AdminOverlay } from "./overlays/adminOverlay.js";
import { BoxEditorOverlay } from "./overlays/boxEditorOverlay.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { AddInputBoxPlugin } from "./plugins/addInputBox.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";
import { LoginPlugin } from "./plugins/login.js";
import { SaveButtonPlugin } from "./plugins/saveButton.js";
import { TextSizerPlugin } from "./plugins/textResizer.js";

import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)
const forms = document.querySelector('#data')
const data = forms.innerHTML

const modeState = {
  current: 'fill',
  switchTo(newMode) {
    this.current = newMode;
    system.eventBus.emit('modeChanged', newMode);
  },
  isAdmin() {
    return this.current === 'admin';
  }
};

const canvasBuilder = new CanvasSystemBuilder(canvas)

const system = canvasBuilder.createEventBus().createRendererRegistry().build()

utilsRegister.on('onRegister', (ns, name, fn) => {
    console.log(`[UTILS] Registered ${name} in ${ns}`);
  });
utilsRegister.registerPlugin(coreUtilsPlugin)

const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry)
const context = renderBuild.createRendererContext()
context.firstScreen = false;


//const textEditorController = new TextEditorController(context.pipeline)

const myPluginManifest = createPluginManifest({ eventBus: system.eventBus, 
 textEditorController: context.textEditorController });
 
renderBuild.registerFromManifest(myPluginManifest)
renderBuild.usePlugin(formIconPlugin)



const rendererSystem = renderBuild.createRendererSystem()
rendererSystem.start();

context.pipeline.setRendererContext(context)

const adminCtx = canvas.getContext('overlay');
const adminOverlay = new AdminOverlay(adminCtx);
const boxEditor = new BoxEditorOverlay(); // allBoxes = array of Box instances
adminOverlay.register(boxEditor);
adminOverlay.setMode(modeState.current)

const logicalWidth = window.innerWidth;
adminOverlay.register(new MessageOverlay());

context.pipeline.add(adminOverlay);



function setupAdminPlugins({ adminOverlay, hitRegistry, hitCtx, logicalWidth, boxEditor, renderer }) {
  const saveButtonPlugin = new SaveButtonPlugin({
    ctx: adminCtx,
    logicalWidth,
    boxes: boxEditor,
    onSave: async (boxes) => {
      const formStructure = boxes
        .filter(box => ['textBox', 'inputBox', 'imageBox'].includes(box.type))
        .map(box => box.serialize());
    
console.log('Form Structure to Save:', formStructure);

      try {
        const response = await fetch('/saveFormStructure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'form-001',
            formStructure,
            label: 'Admin Form Layout'
          }),
        });
    
        if (!response.ok) throw new Error('Failed to save form structure');
        const result = await response.json();
        console.log('Save successful:', result);
      } catch (err) {
        console.error('Save error:', err);
      }
    }
  });

  const addInputPlugin = new AddInputBoxPlugin({
    ctx: adminCtx,
    logicalWidth,
    boxEditor,
    renderer
  });

  adminOverlay.register(saveButtonPlugin);
  adminOverlay.register(addInputPlugin);

  adminOverlay.registerHitRegions(hitRegistry);
  adminOverlay.drawHitRegions(hitCtx);
}

const loginCanvas = document.querySelector('#loginCanvas');
const loginCtx = loginCanvas.getContext('2d');
loginCanvas.width = window.innerWidth;
loginCanvas.height = window.innerHeight;

const loginPlugin = new LoginPlugin({
  ctx: loginCtx,
  onLogin: () => {
    modeState.switchTo('admin');
    console.log('Switched to admin mode');
    adminCanvas.style.pointerEvents = 'auto';
    loginCanvas.style.pointerEvents = 'none'; // disable login canvas once logged in

    setupAdminPlugins({
      adminOverlay,
      hitRegistry: context.hitRegistry,
      hitCtx: canvas.getHitContext('main'),
      logicalWidth,
      boxEditor: boxEditor,
      renderer: context.pipeline
    });

  }
});

function renderLogin() {
  loginCtx.clearRect(0, 0, loginCanvas.width, loginCanvas.height);
  loginPlugin.render({ ctx: loginCtx });
}

renderLogin();

document.addEventListener('pointerdown', e => {
  const { x, y } = utilsRegister.get('mouse', 'getMousePosition')(loginCanvas, e);
  const withinLogin = (
    x >= loginPlugin.bounds.x &&
    x <= loginPlugin.bounds.x + loginPlugin.bounds.width &&
    y >= loginPlugin.bounds.y &&
    y <= loginPlugin.bounds.y + loginPlugin.bounds.height
  );

  if (withinLogin && modeState.current !== 'admin') {
    loginPlugin.handleClick(x, y);
  }
});

const adminCanvas = document.querySelector('#adminOverlayCanvas');
const mousePosition = utilsRegister.get('mouse', 'getMousePosition')

adminCanvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  const { x, y } = mousePosition(adminCanvas, e);

  boxEditor.handleMouseDown(x, y);

  adminOverlay.plugins.forEach(p => {
    if (typeof p.handleClick === 'function') {
      p.handleClick(x, y);
    }
  });

  adminCanvas.setPointerCapture(e.pointerId); // Ensures consistent tracking
});

let lastMove = 0;
adminCanvas.addEventListener('pointermove', e => {
  const now = Date.now();
  if (now - lastMove > 16) { // ~60fps
    const { x, y } = mousePosition(adminCanvas, e);
    boxEditor.handleMouseMove(x, y);
    context.pipeline.invalidate();
    lastMove = now;
  }
  e.preventDefault();
});

adminCanvas.addEventListener('pointerup', () => {
  boxEditor.handleMouseUp();
});


system.eventBus.on('hitClick', (hitObject) => {
  boxEditor.setBoxes(
    Array.from(context.pipeline.drawables).filter(
      d => d.id === hitObject.box.id && (d.type === 'textBox' || d.type === 'inputBox' || d.type === 'imageBox')
    )
  );
    context.pipeline.clearExceptById(hitObject.box.id);
    context.firstScreen = false;
    adminCanvas.style.pointerEvents = 'auto';
 
   // context.pipeline.add(hitObject.box);
   // context.pipeline.add(messageOverlay);
    context.pipeline.invalidate();
  });

  system.eventBus.on('loadForm', (data) => {
    console.log('Loading form data:', data);
    
    context.pipeline.invalidate();
  });

  system.eventBus.on('showMessage', ({ text, position, duration }) => {
    console.log('Showing message:', text, position, duration);
    console.log(context.pipeline.drawables)
    adminOverlay.showMessage(text, position, duration);
    context.pipeline.invalidate();
  });

  system.eventBus.on('modeChanged', (newMode) => {
    boxEditor.setMode(newMode);
    adminCanvas.style.pointerEvents = newMode === 'admin' ? 'auto' : 'none';
    loginCanvas.style.pointerEvents = newMode === 'admin' ? 'none' : 'auto';
    context.pipeline.invalidate();
  });

async function init(data) {
    const info = JSON.parse(data);
    const form = info[1];
    if (!Array.isArray(info)) {
      console.error('Expected array, got:', info);
      return;
    }
  let gap = 20;
  const registry = context.pipeline.renderManager.registry;
    const textSizerPlugin = new TextSizerPlugin({rendererRegistry:registry});
      
      for (const item of form.formStructure) {
        item.startPosition.y += gap;
        item.id = `${form.id}`;
      
        const createBox = utilsRegister.get('box', 'createBoxFromFormItem');
        const renderer = context.pipeline.renderManager
        const box = createBox(item, renderer);

        box.autoResize = true;
        box.textSizerPlugin = textSizerPlugin;
        context.pipeline.add(box);
        gap += 20;
      }
    boxEditor.setBoxes(Array.from(context.pipeline.drawables).filter(d => d.type === 'textBox' || d.type === 'inputBox' || d.type === 'imageBox'));
    boxEditor.setMode(modeState.current);
    // console.log('Boxes set in BoxEditor:', boxEditor.getBoxes());
    context.textEditorController.setBoxes(boxEditor.getBoxes());
  }

 await init(data);