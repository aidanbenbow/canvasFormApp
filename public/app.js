import { UIOverlay } from "./components/UiOverlay.js";

import { CreateForm } from "./components/createForm.js";
import { DashBoardScreen} from "./components/dashBoard.js";
import { FormEditor } from "./components/formEditor.js";
import { FormPanel } from "./components/formPanel.js";
import { UIFormResults } from "./components/formResults.js";
import { UIInputBox } from "./components/inputBox.js";

import { ViewForm } from "./components/viewForm.js";
import { canvasConfig, createPluginManifest } from "./constants.js";

import { fetchAllForms, fetchFormById, fetchFormResults,  onMessageResponse, saveFormStructure, sendLog } from "./controllers/socketController.js";
import { ACTIONS } from "./events/actions.js";
import { FormStore } from "./events/formStore.js";
import { CanvasManager } from "./managers/canvas.js";
import { interactionManager } from "./managers/interaction.js";
import { LayoutManager } from "./managers/layOut.js";
import { AdminOverlay } from "./overlays/adminOverlay.js";
import { BoxEditorOverlay } from "./overlays/boxEditorOverlay.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";

import { LayoutRenderer } from "./renderers/layOutRenderer.js";
import { HitRouter } from "./routes/hitRouter.js";

import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import { wireSystemEvents } from "./setUp/wireSystemEvents.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)

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

const mainCanvas = canvas.layers['main'].canvas;

export const layoutManager = new LayoutManager();
const layoutRenderer = new LayoutRenderer(layoutManager, mainCanvas);

const system = canvasBuilder.createEventBus().createRendererRegistry().build()
export const eventBus = system.eventBus;
  
const store = new FormStore(system.actionDispatcher,system.eventBusManager);

  const renderBuild = new RenderSystemBuilder(canvas, system.eventBus, system.rendererRegistry, layoutManager, layoutRenderer)
  const context = renderBuild.createRendererContext()
  context.canvasManager = canvas; // ✅ Attach canvasManager to context
  context.firstScreen = false;
  
  utilsRegister.registerPlugin(coreUtilsPlugin(context))
context.interactionManager = new interactionManager(canvas, context.hitManager);
context.hitManager.setHitHexFunction(utilsRegister.get('hit', 'getHitHexFromEvent'));

const myPluginManifest = createPluginManifest({ eventBus: system.eventBus, 
 textEditorController: context.textEditorController,
 layoutManager,canvas: mainCanvas });

renderBuild.registerFromManifest(myPluginManifest)
renderBuild.usePlugin(formIconPlugin)

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
  system.actionDispatcher.dispatch(ACTIONS.FORM.SET_LIST, forms, 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.DASHBOARD.SHOW, forms, 'bootstrap');
  const dash = new DashBoardScreen({ context, dispatcher: system.actionDispatcher, eventBusManager: system.eventBusManager, store });
  dash.attachToStage(context.uiStage);
  context.pipeline.invalidate();
}


// system.eventBus.on('dashBoard', (forms) => {
//   console.log('Loading dashboard with forms:', forms);
//   const dashBoardOverlay = new Dashboard({
//     context,
//     layoutManager,
//     layoutRenderer,
//     store,
//     onCreateForm: (form) => {
//       system.eventBus.emit('viewForm', form);
//     },
//     onEditForm: (form) => {
//      console.log('Emitting editForm for:', form);
//     system.eventBus.emit('editForm', form);
//     },
//     onViewResults: (form) => {
//       system.eventBus.emit('viewResults', form);
//     }
//   });
//   context.uiStage.addRoot( dashBoardOverlay);
//   context.uiStage.setActiveRoot('dashboard');
//   context.pipeline.invalidate();
// });

// system.eventBus.on('editForm', (form) => {
//   console.log('Editing form:', form);
//   const editor = new FormEditor({
//     context,
//     layoutManager,
//     layoutRenderer,
    
//     form,
//     onSubmit: updatedForm => {
//       console.log('✅ Form updated:', updatedForm);
     
//       const payload = {
//         id: updatedForm.id,
//         formStructure: updatedForm.formStructure,
//         label: updatedForm.label,
//         user: updatedForm.user,
//     }
//       saveFormStructure(payload);
//     }
//   });

//   context.uiStage.addRoot(editor);
//   context.uiStage.setActiveRoot('formEditor');
//   context.pipeline.invalidate();
// });


// system.eventBus.on('viewResults', async (form) => {
//   console.log('Viewing results for form:', form);
//   const results = await fetchFormResults(form.id);
//   const resultsOverlay = new UIFormResults({
//     form,
//     results,
//     context,
//     layoutManager,
//     layoutRenderer,   
//   });
//   context.uiStage.addRoot(resultsOverlay);
//   context.uiStage.setActiveRoot('formResults');
//   context.pipeline.invalidate();
// });

// system.eventBus.on('viewForm', (formData) => {
//   console.log('Viewing form data:', formData);
//  const formi = new ViewForm({
//     id: `viewForm-${Date.now()}`,
//     context,
//     layoutManager,
//     layoutRenderer,
//     form: formData,
//     onSubmit: (form) => {
//       system.eventBus.emit('formSubmitted', { form});
//     }
//  });
//   context.uiStage.addRoot(formi);
//   context.uiStage.setActiveRoot(formi.id);
//   context.pipeline.invalidate();
// });

// system.eventBus.on('formSubmitted', ({ form }) => {
//   sendLog('Form submitted:', form);
//   onMessageResponse(({ success, result, error }) => {
//     if (success) {
//       const overlay = new UIOverlay({
//         context,
//         layoutManager: context.uiStage.layoutManager,
//         layoutRenderer: context.uiStage.layoutRenderer
//       });
      
//       context.uiStage.overlayRoot = overlay;
      
//       overlay.showMessage({
//         text: '✅ Form submitted successfully!',
//         color: '#0a0',
//         duration: 3000
//       });
//     } else {
//       const overlay = new UIOverlay({
//         context,
//         layoutManager: context.uiStage.layoutManager,
//         layoutRenderer: context.uiStage.layoutRenderer
//       });
      
//       context.uiStage.overlayRoot = overlay;
      
//       overlay.showMessage({
//         text: `❌ Error submitting form: ${error}`,
//         color: '#a00',
//         duration: 5000
//       });
//     }
  
//   });
  
// });

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

  system.eventBus.on('createForm', () => {
    console.log('Creating new form...');
    const createForm = new CreateForm({
      layoutManager,
      layoutRenderer,
      context,
      onSubmit: newForm => {
        console.log('✅ New form created:', newForm);
        const payload = {
          id: newForm.id,
          formStructure: newForm.formStructure,
          label: newForm.label,
          user: newForm.user,
      }
        saveFormStructure(payload);
      }
    });
  
    uiStage.addRoot(createForm);
    uiStage.setActiveRoot('createForm');
    createForm.registerHitRegions(context.hitRegistry);
  });


  
  
 


  system.eventBus.on('modeChanged', (newMode) => {
    boxEditor.setMode(newMode);
   
    context.pipeline.invalidate();
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
 

 