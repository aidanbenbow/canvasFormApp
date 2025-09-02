import { canvasConfig, createPluginManifest } from "./constants.js";
import { CanvasManager } from "./managers/canvas.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";

import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)
const forms = document.querySelector('#data')
const data = forms.innerHTML
console.log(data);

const canvasBuilder = new CanvasSystemBuilder(canvas)

const system = canvasBuilder.createEventBus().createRendererRegistry().build()

utilsRegister.on('onRegister', (ns, name, fn) => {
    console.log(`[UTILS] Registered ${name} in ${ns}`);
  });
utilsRegister.registerPlugin(coreUtilsPlugin)

const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry)

const myPluginManifest = createPluginManifest({ eventBus: system.eventBus });
 
renderBuild.registerFromManifest(myPluginManifest)
renderBuild.usePlugin(formIconPlugin)


const context = renderBuild.createRendererContext()
context.firstScreen = true;

const rendererSystem = renderBuild.createRendererSystem()
rendererSystem.start();

context.pipeline.setRendererContext(context)

const messageOverlay = new MessageOverlay()

system.eventBus.on('hitClick', (hitObject) => {
    context.pipeline.clearExceptById(hitObject.box.id);
    context.firstScreen = false;
   
    context.pipeline.add(hitObject.box);
    context.pipeline.add(messageOverlay);
    context.pipeline.invalidate();
  });

  system.eventBus.on('showMessage', ({ text, position, duration }) => {
    console.log('Showing message:', text, position, duration);
    console.log(context.pipeline.drawables)
    messageOverlay.showMessage(text, position, duration);
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
console.log(box);
        context.pipeline.add(box);
        gap += 20;
      }
    }
  }

 await init(data);