import { canvasConfig, myPluginManifest } from "./constants.js";
import { CanvasManager } from "./managers/canvas.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";

import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)
const forms = document.querySelector('#data')
const data = forms.innerHTML
console.log(data);

const canvasBuilder = new CanvasSystemBuilder(canvas)

const system = canvasBuilder.createEventBus().createRendererRegistry().build()

const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry)

renderBuild.registerFromManifest(myPluginManifest)

const context = renderBuild.createRendererContext()


const rendererSystem = renderBuild.createRendererSystem()
rendererSystem.start();

context.pipeline.setRendererContext(context)

utilsRegister.on('onRegister', (ns, name, fn) => {
    console.log(`[UTILS] Registered ${name} in ${ns}`);
  });
utilsRegister.registerPlugin(coreUtilsPlugin)

async function init(data) {
    const info = JSON.parse(data);
    if (!Array.isArray(info)) {
      console.error('Expected array, got:', info);
      return;
    }
  
    for (const form of info) {
      
      for (const item of form.formStructure) {
        const createBox = utilsRegister.get('box', 'createBoxFromFormItem');
        const renderer = context.pipeline.renderManager
        const box = createBox(item, renderer);
        context.pipeline.add(box);
      }
    }
  }

 await init(data);