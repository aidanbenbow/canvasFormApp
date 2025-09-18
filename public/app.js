import { canvasConfig, createPluginManifest } from "./constants.js";
import { emitFeedback, fetchAllForms, saveFormStructure } from "./controllers/socketController.js";
import { TextEditorController } from "./controllers/textEditor.js";
import { CanvasManager } from "./managers/canvas.js";
import { interactionManager } from "./managers/interaction.js";
import { AdminOverlay } from "./overlays/adminOverlay.js";
import { BoxEditorOverlay } from "./overlays/boxEditorOverlay.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { AddInputBoxPlugin } from "./plugins/addInputBox.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";
import { FormListOverlay } from "./plugins/formListOverlay.js";
import { LoginPlugin } from "./plugins/login.js";
import { SaveButtonPlugin } from "./plugins/saveButton.js";
import { TextSizerPlugin } from "./plugins/textResizer.js";
import { HitRouter } from "./routes/hitRouter.js";

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
export const eventBus = system.eventBus;

utilsRegister.on('onRegister', (ns, name, fn) => {
    console.log(`[UTILS] Registered ${name} in ${ns}`);
  });
  
  const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry)
  const context = renderBuild.createRendererContext()
  context.canvasManager = canvas; // ✅ Attach canvasManager to context
  context.firstScreen = false;
  
  utilsRegister.registerPlugin(coreUtilsPlugin(context))
context.interactionManager = new interactionManager(canvas, context.hitManager);
context.hitManager.setHitHexFunction(utilsRegister.get('hit', 'getHitHex'));

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
let studentCount = 0;
const messagePlugin = adminOverlay.plugins.find(p => p.type === 'messageOverlay');
if (messagePlugin) {
  messagePlugin.setLiveMessage(() => `👥 Students: ${studentCount}`, { x: 20, y: 160 });
}

system.eventBus.on('updateStudentCount', (count) => {
  studentCount = count;
  context.pipeline.invalidate();
});


function setupAdminPlugins({ adminOverlay, hitRegistry, hitCtx, logicalWidth, boxEditor, renderer }) {
  
 let saveButtonPlugin = new SaveButtonPlugin({
    ctx: adminCtx,
    logicalWidth,
    boxes: boxEditor,
    onSave: async (boxes) => {
      const formStructure = boxes
        .filter(box => ['textBox', 'inputBox', 'imageBox'].includes(box.type))
        .map(box => box.serialize());
    
        if (formStructure.length === 0) {
          emitFeedback( {
            success: false,
            text: "Nothing to save ❌",
            box: saveButtonPlugin
          });
          return;
        }
        const payload = {
          id: 'form-001',
          formStructure,
          label: 'Admin Form Layout'
        };
      
      saveFormStructure(payload, saveButtonPlugin);
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

  return { saveButtonPlugin, addInputPlugin };
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
  
    const parsedForms = JSON.parse(data); // your embedded form array

    const formListOverlay = new FormListOverlay({
      ctx: adminCtx,
      forms: parsedForms,
      onEdit: (form) => {
        console.log('Editing form:', form);
        init(JSON.stringify([null, form]));
        context.pipeline.remove(formListOverlay);
      },
      onViewResults: (form) => {
        console.log('Viewing results for form:', form);
        system.eventBus.emit('viewFormResults', form); // or open a results overlay
      }
    
    });
    
    adminOverlay.register(formListOverlay);
    context.pipeline.add(formListOverlay);
    //remove textBox, inputBox, imageBox from pipeline drawables
    const removableBoxes = Array.from(context.pipeline.drawables).filter(d =>
      ['textBox', 'inputBox', 'imageBox'].includes(d.type)
    );
    console.log('Removing boxes:', removableBoxes);
    context.pipeline.remove(...removableBoxes);
    formListOverlay.render();
    context.pipeline.invalidate();
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

const hitRouter = new HitRouter(context.hitRegistry, modeState, context.textEditorController, renderBuild.actionRegistry );
system.eventBus.on('hitClick', ({hex}) => {
  hitRouter.routeHit(hex);
  });

  system.eventBus.on('loadForm', (data) => {
    console.log('Loading form data:', data);
    
    context.pipeline.invalidate();
  });

  system.eventBus.on('socketFeedback', ({ text, position, duration }) => {
    console.log('Showing message:', text, position, duration);
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

  const registry = context.pipeline.renderManager.registry;
    const textSizerPlugin = new TextSizerPlugin({rendererRegistry:registry});
    const canvasWidth = canvas.layers['main'].canvas.width;
    const canvasHeight = canvas.layers['main'].canvas.height;
      
      for (const item of form.formStructure) {
        
        item.id = `${form.id}`;
      
        const createBox = utilsRegister.get('box', 'createBoxFromFormItem');
        const renderer = context.pipeline.renderManager
        const box = createBox(item, renderer, canvasWidth, canvasHeight);

        box.autoResize = true;
        box.textSizerPlugin = textSizerPlugin;
        context.pipeline.add(box);
        
      }
    boxEditor.setBoxes(Array.from(context.pipeline.drawables).filter(d => d.type === 'textBox' || d.type === 'inputBox' || d.type === 'imageBox'));
    boxEditor.setMode(modeState.current);
    // console.log('Boxes set in BoxEditor:', boxEditor.getBoxes());
    context.textEditorController.setBoxes(boxEditor.getBoxes());
  }

 await init(data);