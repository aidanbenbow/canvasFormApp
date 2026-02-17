
import { BaseUIFactory } from "./components/factory/baseUiFactory.js";
import { CommandUIFactory } from "./components/factory/commandUiFactory.js";
import { FormsUIFactory } from "./components/factory/formsUiFactory.js";
import { ResultsUIFactory } from "./components/factory/resultsUiFactory.js";
import { canvasConfig, } from "./constants.js";

import { fetchAllFormResults, fetchAllForms, fetchArticleById, fetchFormById, fetchFormResults,   } from "./controllers/socketController.js";
import { TextEditorController } from "./controllers/textEditor.js";
import { UIStateStore } from "./events/UiStateStore.js";
import { ACTIONS } from "./events/actions.js";
import { FormStore } from "./events/formStore.js";
import { SceneInputSystem } from "./events/sceneInputSystem.js";
import { CanvasManager } from "./managers/canvas.js";
import { FocusManager } from "./managers/focusManager.js";
import { LayoutManager } from "./managers/layOut.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { CommandRegistry } from "./registries/commandRegistry.js";
import { containerRenderer } from "./renderers/containerRenderer.js";
import { LayoutRenderer } from "./renderers/layOutRenderer.js";
import { ScreenRouter } from "./routes/screenRouter.js";
import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import { UIEngine } from "./setUp/uiEngine.js";
import { wireSystemEvents } from "./setUp/wireSystemEvents.js";
import { engineRootLayoutStrategy } from "./strategies/engineRootLayout.js";
import {  utilsRegister } from "./utils/register.js";
import { normalizeFields } from "./utils/normalizeFields.js";


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

  context.uiServices = {};
  
  utilsRegister.registerPlugin(coreUtilsPlugin(context))

  context.pipeline.setRendererContext(context.ctx)

  const uiState = new UIStateStore()
const focusManager = new FocusManager(uiState, system.actionDispatcher)
context.focusManager = focusManager;
context.uiState = uiState;
context.dispatcher = system.actionDispatcher;
const uiengine = new UIEngine({
  layoutStrategy: engineRootLayoutStrategy(),
  renderStrategy: containerRenderer,
  dispatcher: system.actionDispatcher,
  context
});

context.pipeline.setRoot(uiengine.root);

context.pipeline.invalidate();

const textEditor = new TextEditorController({
  pipeline: context.pipeline, 
  popupLayer: context.uiServices.popupLayer,
  canvas: mainCanvas,
  dispatcher: system.actionDispatcher});
context.textEditorController = textEditor;
context.pipeline.setEditor(textEditor);

context.fieldRegistry = new Map();



const screenRouter = new ScreenRouter({ context,uiEngine: uiengine });
const commandRegistry = new CommandRegistry();



const factories = {
  basic: new BaseUIFactory(context, commandRegistry ),
  commandUI: new CommandUIFactory({ commandRegistry }),
  formsUI: new FormsUIFactory({commandRegistry}),
  resultsUI: new ResultsUIFactory(context),
};

commandRegistry.register("form.submit", (payload) => {
  console.log("Form submitted with payload:", payload);
  const activeForm = store.getActiveForm();
  const submittedFields = { ...(payload?.fields || {}) };
  delete submittedFields.done;
  submittedFields.messageYear = 26;

  const normalizedFormFields = normalizeFields(activeForm?.formStructure);
  const allowedFieldIds = new Set(normalizedFormFields.map((field) => field?.id).filter(Boolean));
  const idOnlyFields = Object.fromEntries(
    Object.entries(submittedFields).filter(([key]) => key === 'messageYear' || allowedFieldIds.has(key))
  );

  const responseData = {
    formId: activeForm?.id,
    formLabel: activeForm?.label || null,
    user: activeForm?.user || "admin",
    resultsTable: activeForm?.resultsTable || null,
    formFields: normalizedFormFields,
    fields: idOnlyFields
  };

  if (activeForm) {
    system.actionDispatcher.dispatch(ACTIONS.FORM.SUBMIT, {
      form: activeForm,
      responseData
    });
  }
 const submitNode = factories.basic.create({
  type: 'text',
  text: "Form submitted!",
  id: 'submissionMessage',
  style: {
    font: "32px sans-serif",
    color: "#ffffff",
    backgroundColor: "#0b8f3a",
    borderColor: "#06702c",
    paddingX: 24,
    paddingY: 16,
    radius: 10,
    align: "center",
    shrinkToFit: true,
    maxWidth: Math.floor(mainCanvas.width * 0.9)
  }
 });
 const toastLayer = context.uiServices.toastLayer;
 toastLayer.marginBottom = 70;
 toastLayer.showMessage(submitNode, { timeoutMs: 3000 });

  system.actionDispatcher.dispatch(ACTIONS.KEYBOARD.HIDE);
  system.actionDispatcher.dispatch(ACTIONS.POPUP.HIDE);
  system.actionDispatcher.dispatch(ACTIONS.DROPDOWN.HIDE);
  context.pipeline.invalidate();
});

const sceneInput = new SceneInputSystem({
  canvas: mainCanvas,
  pipeline: context.pipeline,
  ctx: context.ctx
});

wireSystemEvents(system, context, store, screenRouter, factories, commandRegistry);

const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('formId');
const articleID = urlParams.get('articleId');
context.pipeline.start({
  maxWidth: mainCanvas.width,
  maxHeight: mainCanvas.height
})


if (formId) {
  const form = await fetchFormById(formId);
  const tableName = (form.resultsTable || 'progressreports').trim();
  const results = await fetchFormResults(form.id, tableName);

  system.actionDispatcher.dispatch(ACTIONS.FORM.SET_LIST, [form], 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form, 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.FORM.RESULTS_SET, { formId: form.id, results }, 'bootstrap');
  system.actionDispatcher.dispatch(ACTIONS.FORM.VIEW, form, 'bootstrap');
} else if(articleID){
  const article = await fetchArticleById(articleID);
  console.log('Fetched article:', article);
  system.actionDispatcher.dispatch(ACTIONS.ARTICLE.VIEW, article, 'bootstrap');
}
else{
  const {forms} = await fetchAllForms('admin');
 
for(const f of forms){
  const tableName = (f.resultsTable || 'faithandbelief').trim();
  const results = await fetchFormResults(f.id, tableName);
  
system.actionDispatcher.dispatch(ACTIONS.FORM.RESULTS_SET, { formId: f.id, results }, 'bootstrap');
}
system.actionDispatcher.dispatch(ACTIONS.DASHBOARD.SHOW, forms, 'bootstrap');

}


  const toastLayer = context.uiServices.toastLayer;
  const showToast = (text, timeoutMs = 2500) => {
    if (!toastLayer) return;
    const node = factories.basic.create({
      type: 'text',
      text,
      id: `toast-${Date.now()}`,
      style: {
        font: "30px sans-serif",
        color: "#ffffff",
        backgroundColor: "#0b8f3a",
        borderColor: "#06702c",
        paddingX: 22,
        paddingY: 14,
        radius: 10,
        align: "center",
        shrinkToFit: true
      }
    });
    toastLayer.showMessage(node, { timeoutMs });
  };

  system.eventBus.on('socketFeedback', ({ text, position, duration }) => {
    console.log('Showing message:', text, position, duration);
    showToast(text, duration);
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
 

 