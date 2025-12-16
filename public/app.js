import { UIOverlay } from "./components/UiOverlay.js";

import { CreateForm } from "./components/createForm.js";
import { DashBoardScreen} from "./components/dashBoard.js";

import { canvasConfig, } from "./constants.js";

import { fetchAllForms, fetchFormById, fetchFormResults,  onMessageResponse, saveFormStructure, sendLog } from "./controllers/socketController.js";
import { ACTIONS } from "./events/actions.js";
import { FormStore } from "./events/formStore.js";
import { UIOverlayManager } from "./managers/UiOverlayManager.js";
import { CanvasManager } from "./managers/canvas.js";
import { HitTestManager } from "./managers/hit.js";

import { LayoutManager } from "./managers/layOut.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { LayoutRenderer } from "./renderers/layOutRenderer.js";
import { HitRouter } from "./routes/hitRouter.js";
import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import { wireSystemEvents } from "./setUp/wireSystemEvents.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)

const canvasBuilder = new CanvasSystemBuilder(canvas)

const mainCanvas = canvas.layers['main'].canvas;

export const layoutManager = new LayoutManager();
const layoutRenderer = new LayoutRenderer(layoutManager, mainCanvas);

const system = canvasBuilder.createEventBus().createRendererRegistry().build()
export const eventBus = system.eventBus;
export const dispatcher = system.actionDispatcher;
  
const store = new FormStore(system.actionDispatcher,system.eventBusManager);

  const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry, layoutManager, layoutRenderer)
  const context = renderBuild.createRendererContext()
  context.canvasManager = canvas; // ✅ Attach canvasManager to context
  context.firstScreen = false;
  
  utilsRegister.registerPlugin(coreUtilsPlugin(context))


const rendererSystem = renderBuild.createRendererSystem()
rendererSystem.start();

context.pipeline.setRendererContext(context)

context.pipeline.add(context.uiStage);

wireSystemEvents(system, context, store);

const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('formId');



if (formId) {
  const form = await fetchFormById(formId);
  system.actionDispatcher.dispatch(ACTIONS.FORM.SET_LIST, [form], 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form, 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.FORM.VIEW, form, 'bootstrap');
} else{
  const {forms} = await fetchAllForms('admin');
  // system.actionDispatcher.dispatch(ACTIONS.FORM.SET_LIST, forms, 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.DASHBOARD.SHOW, forms, 'bootstrap');
for(const f of forms){
  const results = await fetchFormResults(f.id, f.resultsTable || 'faithandbelief');
system.actionDispatcher.dispatch(ACTIONS.FORM.RESULTS_SET, { formId: f.id, results }, 'bootstrap');

context.overlayManager.showSuccess(`Loaded ${forms.length} forms from server.`);
}

  const dash = new DashBoardScreen({ context, dispatcher: system.actionDispatcher, eventBusManager: system.eventBusManager, store });
  dash.layout(window.innerWidth, window.innerHeight);
  dash.attachToStage(context.uiStage);
  context.pipeline.invalidate();
}


  system.eventBus.on('socketFeedback', ({ text, position, duration }) => {
    console.log('Showing message:', text, position, duration);
   context.overlayManager.showSuccess(text, position, duration);
  });


  system.eventBus.on('formResultsUpdated', () => {
    context.pipeline.invalidate();
  });

  let activeKeyboard = null;

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
 

 