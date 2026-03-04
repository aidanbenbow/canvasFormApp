
import { BaseUIFactory } from "./components/factory/baseUiFactory.js";
import { CommandUIFactory } from "./components/factory/commandUiFactory.js";
import { FormsUIFactory } from "./components/factory/formsUiFactory.js";
import { ResultsUIFactory } from "./components/factory/resultsUiFactory.js";
import { canvasConfig, } from "./constants.js";

import { TextEditorController } from "./controllers/textEditor.js";
import { UIStateStore } from "./events/UiStateStore.js";
import { ACTIONS } from "./events/actions.js";

import { SceneInputSystem } from "./events/sceneInputSystem.js";
import { CanvasManager } from "./managers/canvas.js";
import { FocusManager } from "./managers/focusManager.js";
import { LayoutManager } from "./managers/layOut.js";
import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { CommandRegistry } from "./registries/commandRegistry.js";
import { containerRenderer } from "./renderers/containerRenderer.js";
import { LayoutRenderer } from "./renderers/layOutRenderer.js";
import { ScreenRouter } from "./routes/screenRouter.js";
import { ROUTES } from "./routes/routeNames.js";
import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import { UIEngine } from "./setUp/uiEngine.js";
import { wireSystemEvents } from "./setUp/wireSystemEvents.js";

import socket from "./socketClient.js";
import { engineRootLayoutStrategy } from "./strategies/engineRootLayout.js";
import {  utilsRegister } from "./utils/register.js";
import { normalizeFields } from "./utils/normalizeFields.js";
import { articleService } from "./services/articleService.js";
import { articleRepository } from "./repositories/articleRepository.js";
import { formRepository } from "./repositories/formRepository.js";
import { formResultsRepository } from "./repositories/formResultsRepository.js";
import { formStore } from "./stores/storeInstance.js";
// ⭐ NEW: command loader
import { screenRegistry } from "./registries/screenRegistry.js";
import { DashBoardScreen } from "./components/dashBoard.js";
import { FormViewScreen } from "./components/viewForm.js";
import { UIFormResults } from "./components/formResults.js";
import { CreateForm } from "./components/createForm.js";
import { EditForm } from "./components/editForm.js";
import { articleViewScreen } from "./components/articleView.js";
import { LoginScreen } from "./components/loginScreen.js";
import { createLegacyAppContext } from "./setUp/appContext.js";
import { Container } from "./core/di/Container.js";
import { TOKENS } from "./core/di/tokens.js";
import { bootstrapApp } from "./bootStrapStuff.js";

// ------------------------------------------------------------
// ENGINE + CONTEXT SETUP
// ------------------------------------------------------------
const canvas = new CanvasManager(canvasConfig)

const canvasBuilder = new CanvasSystemBuilder(canvas)

const mainCanvas = canvas.layers['main'].canvas;

export const layoutManager = new LayoutManager();
const layoutRenderer = new LayoutRenderer(layoutManager, mainCanvas);

const system = canvasBuilder.createEventBus().createRendererRegistry().build()
export const eventBus = system.eventBus;


export const dispatcher = system.actionDispatcher;
 
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



const screenRouter = new ScreenRouter({ context, uiEngine: uiengine, screenRegistry });
const commandRegistry = new CommandRegistry();
const appContainer = new Container();
context.commandRegistry = commandRegistry;
context.screenRouter = screenRouter;
context.store = formStore;

context.eventBusManager = system.eventBusManager;



const factories = {
  basic: new BaseUIFactory(context, commandRegistry ),
  commandUI: new CommandUIFactory({ commandRegistry }),
  formsUI: new FormsUIFactory(context, commandRegistry),
  resultsUI: new ResultsUIFactory(context),
};
context.factories = factories;


function registerScreens() {
  screenRegistry.register(ROUTES.dashboard, DashBoardScreen);
  screenRegistry.register(ROUTES.formView, FormViewScreen);
  screenRegistry.register(ROUTES.formResults, UIFormResults);
  screenRegistry.register(ROUTES.formCreate, CreateForm);
  screenRegistry.register(ROUTES.formEdit, EditForm);
  screenRegistry.register(ROUTES.articleView, articleViewScreen);
  screenRegistry.register(ROUTES.articleEdit, articleViewScreen);
  screenRegistry.register(ROUTES.login, LoginScreen);
}

registerScreens();

// ------------------------------------------------------------
// LOGIN SCREEN
// ------------------------------------------------------------
function showLoginScreen() {
  const login = new LoginScreen({
    context,
    dispatcher: system.actionDispatcher
  });
  const rootNode = login.createRoot();
  // ⭐ VERY IMPORTANT
  context.uiState = context.uiState || {};
  context.uiState.currentScreen = login;
  uiengine.mountScene(rootNode);
}

const sceneInput = new SceneInputSystem({
  canvas: mainCanvas,
  pipeline: context.pipeline,
  ctx: context.ctx
});

// ------------------------------------------------------------
// WIRE SYSTEM EVENTS
// ------------------------------------------------------------
wireSystemEvents(system, context, screenRouter, factories, commandRegistry);

// ------------------------------------------------------------
// TOASTS
// ------------------------------------------------------------
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

// ------------------------------------------------------------
//app context setup
// ------------------------------------------------------------
const repositories = {
  formRepository,
  formResultsRepository,
  articleRepository,
};

const services = {
  articleService,
  
};

const hideKeyboard = () => system.actionDispatcher.dispatch(ACTIONS.KEYBOARD.HIDE);
const hidePopup = () => system.actionDispatcher.dispatch(ACTIONS.POPUP.HIDE);
const hideDropdown = () => system.actionDispatcher.dispatch(ACTIONS.DROPDOWN.HIDE);

const uiServices = {
  showToast,
  hideKeyboard,
  hidePopup,
  hideDropdown,
};

const input = {
  dragController: context.dragController,
  textEditorController: textEditor,
  selectionController: context.selectionController,
  focusManager,
};

appContainer
  .instance(TOKENS.commandRegistry, commandRegistry)
  .instance(TOKENS.screenRouter, screenRouter)
  .instance(TOKENS.uiEngine, uiengine)
  .instance(TOKENS.rendererContext, context)
  .instance(TOKENS.repositories, repositories)
  .instance(TOKENS.services, services);

export { appContainer };

export const appContext = createLegacyAppContext({
  container: appContainer,
  tokens: TOKENS,
  screenRegistry,
  repositories,
  services,
  uiServices,
  input,
  state: {
    uiState,
  },
});



  // ------------------------------------------------------------
// ⭐ REGISTER ALL COMMANDS (clean, modular)
// ------------------------------------------------------------
bootstrapApp({
  commandRegistry,
  context,
  system,
  socket,
  showToast,  screenRouter
});
// registerAllCommands({
//   commandRegistry,
//   context,
//   formStore,
//   formService,
//   system,
//   socket,
//   showToast,
//   screenRouter
// });

// ------------------------------------------------------------
// MAIN APP BOOTSTRAP LOGIC
// ------------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('formId');
const articleID = urlParams.get('articleId');
const mode = String(urlParams.get('mode') || '').trim().toLowerCase();
context.pipeline.start({
  maxWidth: mainCanvas.width,
  maxHeight: mainCanvas.height
})


// Session check and main app logic
const token = localStorage.getItem('sessionToken');
const username = localStorage.getItem('username');

async function runMainApp() {
  try {
    if (formId) {
      return commandRegistry.execute("app.openForm", { formId });
    }

    if (articleID) {
      return commandRegistry.execute("app.openArticle", {
        articleId: articleID,
        mode
      });
    }

    return commandRegistry.execute("app.bootstrap");
  } catch (err) {
    console.error(err);
  }
}

// ------------------------------------------------------------
// SESSION VALIDATION
// ------------------------------------------------------------
if (token && username) {
  socket.emit('validateSession', { token });
  socket.once('validateSessionResponse', (resp) => {
    if (resp.valid) {
      runMainApp();
    } else {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('username');
      showLoginScreen();
    }
  });
} else {
  showLoginScreen();
}


function resolveResultsTableName(form) {
  const explicitTable = typeof form?.resultsTable === 'string' ? form.resultsTable.trim() : '';
  if (explicitTable) return explicitTable;

  const normalizedFormId = String(form?.formId || form?.id || `form-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_');

  return `form_results_${normalizedFormId}`.slice(0, 255);
}

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
 

 