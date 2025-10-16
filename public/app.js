import { canvasConfig, createPluginManifest } from "./constants.js";
import { emitFeedback, fetchAllForms, fetchFormResults, saveFormStructure } from "./controllers/socketController.js";
import { TextEditorController } from "./controllers/textEditor.js";
import { CanvasManager } from "./managers/canvas.js";
import { interactionManager } from "./managers/interaction.js";
import { LayoutManager } from "./managers/layOut.js";
import { AdminOverlay } from "./overlays/adminOverlay.js";
import { BoxEditorOverlay } from "./overlays/boxEditorOverlay.js";
import { FormResultsOverlay } from "./overlays/formResults.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { WelcomeOverlay } from "./overlays/welcomeOverlay.js";
import { AddBoxPlugin } from "./plugins/addInputBox.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";
import { FormListOverlay } from "./plugins/formListOverlay.js";
import { LoginPlugin } from "./plugins/login.js";
import { PopupKeyboardPlugin } from "./plugins/popUpKeyboard.js";
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
context.hitManager.setHitHexFunction(utilsRegister.get('hit', 'getHitHexFromEvent'));

const layoutManager = new LayoutManager({ logicalWidth: 1000, logicalHeight: 1000 });
const mainCanvas = canvas.layers['main'].canvas;

const myPluginManifest = createPluginManifest({ eventBus: system.eventBus, 
 textEditorController: context.textEditorController,
 layoutManager,canvas: mainCanvas });

renderBuild.registerFromManifest(myPluginManifest)
renderBuild.usePlugin(formIconPlugin)



const rendererSystem = renderBuild.createRendererSystem()
rendererSystem.start();

context.pipeline.setRendererContext(context)

const adminCtx = canvas.getContext('overlay');
const adminOverlay = new AdminOverlay(adminCtx);
const boxEditor = new BoxEditorOverlay(system.eventBus); // allBoxes = array of Box instances
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
          id: boxEditor.formMeta.id||`form-${Date.now()}`,
          formStructure,
          label: boxEditor.formMeta.label||'Untitled Form',
          resultsTable: boxEditor.formMeta.resultsTable||'cscstudents'
        };
      
      saveFormStructure(payload, saveButtonPlugin);
      }
  });


  const addInputPlugin = new AddBoxPlugin({
    ctx: adminCtx,
    logicalWidth,
    boxEditor,
    renderer,
    boxType: 'inputBox', 
    yOffset: 50
  });

  const addTextPlugin = new AddBoxPlugin({
    ctx: adminCtx,
    logicalWidth,
    boxEditor,
    renderer,
    boxType: 'textBox'
  });

  const addImagePlugin = new AddBoxPlugin({
    ctx: adminCtx,
    logicalWidth,
    boxEditor,
    renderer,
    boxType: 'imageBox',
    yOffset: 90
  });
  adminOverlay.register(addImagePlugin);
  

  adminOverlay.register(saveButtonPlugin);
  adminOverlay.register(addInputPlugin);
  adminOverlay.register(addTextPlugin);

  adminOverlay.registerHitRegions(hitRegistry);
  adminOverlay.drawHitRegions(hitCtx);

  return { saveButtonPlugin, addInputPlugin };
}

const loginCanvas = document.querySelector('#loginCanvas');
const loginCtx = loginCanvas.getContext('2d');
loginCanvas.width = window.innerWidth;
loginCanvas.height = window.innerHeight;
context.loginCtx = loginCtx;

const loginPlugin = new LoginPlugin({
  ctx: loginCtx,
  onLogin: () => {
    modeState.switchTo('admin');
    
    adminCanvas.style.pointerEvents = 'auto';
    loginCanvas.style.pointerEvents = 'none';

    // ✅ Remove loginPlugin from pipeline
    context.pipeline.remove(loginPlugin);
    context.pipeline.remove(welcomeOverlay); // Ensure admin overlay is not rendered
   // ✅ Clear the login canvas
  loginCtx.clearRect(0, 0, loginCanvas.width, loginCanvas.height);
    const parsedForms = JSON.parse(data);

    const formListOverlay = new FormListOverlay({
      ctx: adminCtx,
      forms: parsedForms,
      onEdit: (form) => {
        setupAdminPlugins({
          adminOverlay,
          hitRegistry: context.hitRegistry,
          hitCtx: canvas.getHitContext('main'),
          logicalWidth,
          boxEditor,
          renderer: context.pipeline
        });
        boxEditor.formMeta = form;
        init(JSON.stringify([null, form]));
        adminOverlay.unregister(formListOverlay);
        context.pipeline.invalidate();
      },
      onViewResults: (formMeta) => {
        adminOverlay.unregister(formListOverlay);

        fetchFormResults(formMeta.id, (results) => {
          const resultsOverlay = new FormResultsOverlay({
            ctx: adminCtx,
            form: { ...formMeta, responses: results },
            onBack: () => {
              resultsOverlay.unbindEvents();
              adminOverlay.unregister(resultsOverlay);
              adminOverlay.register(formListOverlay);
              context.pipeline.invalidate();
            }
            
          });
          resultsOverlay.registerHitRegion(context.hitRegistry);
          resultsOverlay.bindEvents();
          adminOverlay.register(resultsOverlay);
          context.pipeline.invalidate();
        }, formMeta.resultsTable || 'cscstudents');
      }
     
    });

    adminOverlay.register(formListOverlay);
    context.pipeline.add(formListOverlay);

    const removableBoxes = Array.from(context.pipeline.drawables).filter(d =>
      ['textBox', 'inputBox', 'imageBox'].includes(d.type)
    );
   
    context.pipeline.remove(...removableBoxes);

    formListOverlay.render();
    context.pipeline.invalidate();
  },
  eventBus: system.eventBus,
  editorController: context.textEditorController,
  layoutManager
});

const welcomeOverlay = new WelcomeOverlay({ ctx: loginCtx, layoutManager });
context.pipeline.add(welcomeOverlay);
loginPlugin.registerHitRegion(context.hitRegistry);

function renderLogin() {
  loginCtx.clearRect(0, 0, loginCanvas.width, loginCanvas.height);
  loginCanvas.style.pointerEvents = 'auto';

  loginPlugin.render({ctx: loginCtx });
  context.pipeline.add(loginPlugin);
  
}

renderLogin();

document.addEventListener('pointerdown', e => {
  const { x, y } = utilsRegister.get('mouse', 'getMousePosition')(loginCanvas, e);

  hitRouter.routePointer(x, y);
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

const hitRouter = new HitRouter(context.hitRegistry, modeState, context.textEditorController, renderBuild.actionRegistry, layoutManager, mainCanvas.width, mainCanvas.height);
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

  system.eventBus.on('formResultsUpdated', () => {
    context.pipeline.invalidate();
  });

  let activeKeyboard = null;


  system.eventBus.on('showKeyboard', ({ box, field }) => {
    adminCanvas.style.pointerEvents = 'auto';
    // ✅ Remove previous keyboard if it exists
  if (activeKeyboard) {
    adminOverlay.unregister(activeKeyboard);
    context.pipeline.remove(activeKeyboard);
    activeKeyboard = null;
  }
    const keyboard = new PopupKeyboardPlugin({
      ctx: adminCtx,
      editorController: context.textEditorController,
      position: { x: 50, y: window.innerHeight - 250 }
    });
    adminOverlay.register(keyboard);
    activeKeyboard = keyboard;
    context.pipeline.invalidate();
  });
  
  system.eventBus.on('hideKeyboard', () => {
    if (activeKeyboard) {
      adminOverlay.unregister(activeKeyboard);
      context.pipeline.remove(activeKeyboard);
      activeKeyboard = null;
    }
    if (modeState.current !== 'admin') {
      adminCanvas.style.pointerEvents = 'none';
    }
    context.pipeline.invalidate();
  });
  
  system.eventBus.on('loginAttempt', ({ password }) => {
    if (password === 'aa') {
      loginPlugin.onLogin();
    } else {
      system.eventBus.emit('socketFeedback', {
        text: 'Incorrect password ❌',
        position: { x: 10, y: 100 },
        duration: 2000
      });
    }
  });
  
  system.eventBus.on('boxDeleted', (id) => {
    context.pipeline.remove(activeKeyboard);
    activeKeyboard = null;
    context.pipeline.remove(...Array.from(context.pipeline.drawables).filter(d => d.id === id));
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
        
        item.id = item.id || `box-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
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

 //await init(data);