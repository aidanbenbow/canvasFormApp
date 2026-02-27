
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

import socket from "./socketClient.js";
import { engineRootLayoutStrategy } from "./strategies/engineRootLayout.js";
import {  utilsRegister } from "./utils/register.js";
import { normalizeFields } from "./utils/normalizeFields.js";
import { articleService } from "./services/articleService.js";
import { articleRepository } from "./repositories/articleRepository.js";
import { formRepository } from "./repositories/formRepository.js";
import { formResultsRepository } from "./repositories/formResultsRepository.js";
// ⭐ NEW: command loader
import { registerAllCommands } from "./commands/index.js";
import { formStore } from "./stores/storeInstance.js";

import { screenRegistry } from "./registries/screenRegistry.js";
import { DashBoardScreen } from "./components/dashBoard.js";
import { FormViewScreen } from "./components/viewForm.js";
import { UIFormResults } from "./components/formResults.js";
import { CreateForm } from "./components/createForm.js";
import { EditForm } from "./components/editForm.js";
import { LoginScreen } from "./components/loginScreen.js";


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
formStore.connect(eventBus); // Connect FormStore to the event bus

export const dispatcher = system.actionDispatcher;
  
//const store = new FormStore(system.actionDispatcher,system.eventBusManager);

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
  formsUI: new FormsUIFactory(context, commandRegistry),
  resultsUI: new ResultsUIFactory(context),
};
context.factories = factories;


function registerScreens() {
  screenRegistry.register("dashboard", DashBoardScreen);
  screenRegistry.register("formView", FormViewScreen);
  screenRegistry.register("formResults", UIFormResults);
  screenRegistry.register("formCreate", CreateForm);
  screenRegistry.register("formEdit", EditForm);
  screenRegistry.register("login", LoginScreen);
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

// function runMainApp() {
//   console.log('[DEBUG] runMainApp called');
//   if (formId) {
//     fetchFormById(formId).then(form => {
//       const tableName = resolveResultsTableName(form);
//       fetchFormResults(form.formId, tableName).then(results => {
//         system.actionDispatcher.dispatch(ACTIONS.FORM.SET_LIST, [form], 'bootstrap');
//         system.actionDispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form, 'bootstrap');
//         system.actionDispatcher.dispatch(ACTIONS.FORM.RESULTS_SET, { formId: form.formId, results }, 'bootstrap');
//         screenRouter.replace('formView', { form, results, mode: 'view' });
//       });
//     });
//   } else if(articleID){
//     fetchArticleById(articleID).then(article => {
//       if (mode === 'edit') {
//         screenRouter.replace('formEdit', { article, mode: 'edit' });
//       } else {
//        screenRouter.replace('formView', { article, mode: 'view' });
//       }
//     });
//   }
//   else{
//     formRepository.fetchAllForms().then((forms) => {
//       for (const f of forms) {
//         formResultsRepository.fetchResults(f.formId).then((results) => {
//           system.actionDispatcher.dispatch(
//             ACTIONS.FORM.RESULTS_SET,
//             { formId: f.formId, results },
//             "bootstrap"
//           );
//         });
//       }

//       screenRouter.replace('dashboard', { forms });
//     });
//   }
// }

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
// ⭐ REGISTER ALL COMMANDS (clean, modular)
// ------------------------------------------------------------
registerAllCommands({
  commandRegistry,
  context,
  formStore,
  system,
  socket,
  showToast
});


//   commandRegistry.register("form.submit", (payload) => {
//   console.log("Form submitted with payload:", payload);
//   const activeForm = store.getActiveForm();
//   if (!activeForm) return;

//   // Only send user intent and raw input fields
//   const submission = {
//     formId: activeForm.formId,
//     userId: username || 'admin',
//     fields: { ...(payload?.fields || {}) }
//   };
// console.log("Dispatching form submission:", submission);
//   system.actionDispatcher.dispatch(ACTIONS.FORM.SUBMIT, submission);
//   showToast("Form submitted ✅", 3000);

//   system.actionDispatcher.dispatch(ACTIONS.KEYBOARD.HIDE);
//   system.actionDispatcher.dispatch(ACTIONS.POPUP.HIDE);
//   system.actionDispatcher.dispatch(ACTIONS.DROPDOWN.HIDE);
//   context.pipeline.invalidate();
// });

// commandRegistry.register("article.save", async payload => {
//   try {
//     const article = await articleRepository.updateArticle(
//       payload.articleId,
//       payload.updates
//     );

//     articleService.updateArticle(article);

//     system.eventBus.emit("socketFeedback", {
//       text: "Article saved successfully! ✅"
//     });
//   } catch (err) {
//     console.error(err);
//   }
// });

// commandRegistry.register('report.save', (payload) => {
//   console.log('Report save command received with payload:', payload);
//   // Simulate save operation
//   setTimeout(() => {
//     system.eventBus.emit('socketFeedback', {
//       text: 'Report saved successfully! ✅',
//       position: { x: 100, y: 50 },
//       duration: 2200
//     });
//   }, 1000);
// });

// // Register LOGIN command for login screen
// commandRegistry.register('LOGIN', (payload = {}) => {
//   // Find the login screen's rootNode and extract input values
//   const loginScreen = context.uiState?.currentScreen;
//   const rootNode = loginScreen?.rootNode;
//   console.log('[DEBUG] LOGIN rootNode:', rootNode);
//   const usernameNode = rootNode?.findById?.("login-username");
//   const passwordNode = rootNode?.findById?.("login-password");
//   console.log('[DEBUG] usernameNode:', usernameNode);
//   const username = usernameNode?.getValue?.() || '';
//   const password = passwordNode?.getValue?.() || '';
//   console.log('[DEBUG] LOGIN command executed', { username, password });
//   if (!username || !password) {
//     loginScreen?.showError?.('Enter username and password');
//     return;
//   }
//   socket.emit('loginUser', { username, password });
//   socket.once('loginUserResponse', (resp) => {
//     console.log('[DEBUG] loginUserResponse', resp);
//     if (resp.success && resp.token) {
//       localStorage.setItem('sessionToken', resp.token);
//       localStorage.setItem('username', username);
//       // Show dashboard after login
//       runMainApp();
//     } else {
//       // Find login screen and show error
//       loginScreen?.showError?.(resp.error || 'Login failed');
//     }
//   });
// });

//   system.eventBus.on('socketFeedback', ({ text, position, duration }) => {
//     console.log('Showing message:', text, position, duration);
//     showToast(text, duration);
//   });


//   system.eventBus.on('formResultsUpdated', () => {
//     context.pipeline.invalidate();
//   });

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
 

 