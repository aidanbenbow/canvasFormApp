import { canvasConfig, createPluginManifest } from "./constants.js";
import { TextEditorController } from "./controllers/textEditor.js";
import { CanvasManager } from "./managers/canvas.js";
import { AdminOverlay } from "./overlays/adminOverlay.js";
import { BoxEditorOverlay } from "./overlays/boxEditorOverlay.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";
import { SaveButtonPlugin } from "./plugins/saveButton.js";

import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)
const forms = document.querySelector('#data')
const data = forms.innerHTML

const canvasBuilder = new CanvasSystemBuilder(canvas)

const system = canvasBuilder.createEventBus().createRendererRegistry().build()

utilsRegister.on('onRegister', (ns, name, fn) => {
    console.log(`[UTILS] Registered ${name} in ${ns}`);
  });
utilsRegister.registerPlugin(coreUtilsPlugin)

const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry)
const context = renderBuild.createRendererContext()
context.firstScreen = true;


const textEditorController = new TextEditorController(context.pipeline)

const myPluginManifest = createPluginManifest({ eventBus: system.eventBus, textEditorController });
 
renderBuild.registerFromManifest(myPluginManifest)
renderBuild.usePlugin(formIconPlugin)



const rendererSystem = renderBuild.createRendererSystem()
rendererSystem.start();

context.pipeline.setRendererContext(context)

const adminCtx = canvas.getContext('overlay');
const adminOverlay = new AdminOverlay(adminCtx);
const boxEditor = new BoxEditorOverlay(); // allBoxes = array of Box instances
adminOverlay.register(boxEditor);

const logicalWidth = window.innerWidth;
adminOverlay.register(new MessageOverlay());
adminOverlay.register(new SaveButtonPlugin({
  ctx: adminCtx,
  onSave: (boxes) => {
    console.log('Saving boxes:', boxes);
},
  logicalWidth
}
));
context.pipeline.add(adminOverlay);

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

async function init(data) {
    const info = JSON.parse(data);
    if (!Array.isArray(info)) {
      console.error('Expected array, got:', info);
      return;
    }
  let gap = 20;
    for (const form of info) {
      
      for (const item of form.formStructure) {
        item.startPosition.y += gap;
        item.id = `${form.id}`;
        
        const createBox = utilsRegister.get('box', 'createBoxFromFormItem');
        const renderer = context.pipeline.renderManager
        const box = createBox(item, renderer);

        context.pipeline.add(box);
        gap += 20;
      }
    }
  }

 await init(data);