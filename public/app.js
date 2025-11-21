import { UIOverlay } from "./components/UiOverlay.js";
import { AllForms } from "./components/allForms.js";
import { CreateForm } from "./components/createForm.js";
import { Dashboard } from "./components/dashBoard.js";
import { FormEditor } from "./components/formEditor.js";
import { FormPanel } from "./components/formPanel.js";
import { UIFormResults } from "./components/formResults.js";
import { UIInputBox } from "./components/inputBox.js";
import { PopupKeyboard } from "./components/keyBoard.js";
import { ResultsPanel } from "./components/resultsPanel.js";
import { ViewForm } from "./components/viewForm.js";
import { canvasConfig, createPluginManifest } from "./constants.js";
import { DragController } from "./controllers/dragController.js";
import { emitFeedback, fetchAllForms, fetchFormById, fetchFormResults, loadFormStructure, onMessageResponse, saveFormStructure, sendLog } from "./controllers/socketController.js";
import { FormStore } from "./events/formStore.js";
import { CanvasManager } from "./managers/canvas.js";
import { interactionManager } from "./managers/interaction.js";
import { LayoutManager } from "./managers/layOut.js";
import { AdminOverlay } from "./overlays/adminOverlay.js";
import { BoxEditorOverlay } from "./overlays/boxEditorOverlay.js";
import { FormResultsOverlay } from "./overlays/formResults.js";
import { MessageOverlay } from "./overlays/messageOverlay.js";
import { WelcomeOverlay } from "./overlays/welcomeOverlay.js";

import { coreUtilsPlugin } from "./plugins/coreUtilsPlugin.js";
import { formIconPlugin } from "./plugins/formIconPlugin.js";

import { blankFormManifest, discussionFeedbackFormManifest, feedbackFormManifest, formManifest, pluginRegistry } from "./plugins/formManifests.js";
import { LoginPlugin } from "./plugins/login.js";

import { TextSizerPlugin } from "./plugins/textResizer.js";
import { UIRootRegistry } from "./registries/UIRootRegistry.js";
import { registerFieldTypes } from "./registries/registerFieldTypes.js";
import { LayoutRenderer } from "./renderers/layOutRenderer.js";
import { HitRouter } from "./routes/hitRouter.js";

import { CanvasSystemBuilder } from "./setUp/canvasSystemBuilder.js";
import { RenderSystemBuilder } from "./setUp/renderSystemBuilder.js";
import {  utilsRegister } from "./utils/register.js";


const canvas = new CanvasManager(canvasConfig)

// const forms = document.querySelector('#data')
// const data = forms.innerHTML
// const raw = JSON.parse(data);
// console.log('Form data loaded:', raw[0].formStructure);
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

const adminCtx = canvas.getContext('overlay');
const adminOverlay = new AdminOverlay(adminCtx);
const boxEditor = new BoxEditorOverlay(system.eventBus); // allBoxes = array of Box instances
adminOverlay.register(boxEditor);
adminOverlay.setMode(modeState.current)

adminOverlay.register(new MessageOverlay());

context.pipeline.add(adminOverlay);


function transitionToAdminMode() {
 // modeState.switchTo('admin');
 // system.eventBus.emit('hideKeyboard');
 context.hitRegistry.clear();
  const dashboardOverlay = new Dashboard({
    forms: data,
    layoutManager,
    layoutRenderer,
    onCreateForm: () => {
      system.eventBus.emit('createForm');
    },
    onEditForm: (form) => {
     //console.log('Emitting editForm for:', form);
     system.eventBus.emit('editForm', form);
    },
    onViewResults: (form) => {
      system.eventBus.emit('viewResults', form);
    }
  });
  uiStage.addRoot( dashboardOverlay);
  uiStage.setActiveRoot('dashboard');
dashboardOverlay.registerHitRegions(context.hitRegistry);
}

context.pipeline.add(context.uiStage);

// const dashBoardOverlay = new Dashboard({
//   forms: data,
//   context,
//   layoutManager,
//   layoutRenderer,
//   onCreateForm: (form) => {
//     system.eventBus.emit('viewForm', form);
//   },
//   onEditForm: (form) => {
//    console.log('Emitting editForm for:', form);
//   // system.eventBus.emit('editForm', form);
//   },
//   onViewResults: (form) => {
//    // system.eventBus.emit('viewResults', form);
//   }
// });
// context.uiStage.addRoot( dashBoardOverlay);
// context.uiStage.setActiveRoot('dashboard');
// context.pipeline.invalidate();



const load = ['viewForm', 'dashBoard'];


const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('formId');

const store = new FormStore(system.eventBus);

if (formId) {
  // Load a single form for public viewing
  fetchFormById(formId).then(form => {
    store.setForms([form]);
    system.eventBus.emit('viewForm', form);
  }).catch(err => {
    console.error('Error loading form:', err);
  });
} else {
  // Load all forms for the current user (e.g. admin)
  fetchAllForms('admin').then(({ user, forms }) => {
    store.setForms(forms);
    system.eventBus.emit('dashBoard', forms);
  }).catch(err => {
    console.error('Error fetching forms:', err);
  });
}


system.eventBus.on('dashBoard', (forms) => {
  console.log('Loading dashboard with forms:', forms);
  const dashBoardOverlay = new Dashboard({
    context,
    layoutManager,
    layoutRenderer,
    store,
    onCreateForm: (form) => {
      system.eventBus.emit('viewForm', form);
    },
    onEditForm: (form) => {
     console.log('Emitting editForm for:', form);
    system.eventBus.emit('editForm', form);
    },
    onViewResults: (form) => {
      system.eventBus.emit('viewResults', form);
    }
  });
  context.uiStage.addRoot( dashBoardOverlay);
  context.uiStage.setActiveRoot('dashboard');
  context.pipeline.invalidate();
});

system.eventBus.on('editForm', (form) => {
  console.log('Editing form:', form);
  const editor = new FormEditor({
    context,
    layoutManager,
    layoutRenderer,
    
    form,
    onSubmit: updatedForm => {
      console.log('✅ Form updated:', updatedForm);
     
      const payload = {
        id: updatedForm.id,
        formStructure: updatedForm.formStructure,
        label: updatedForm.label,
        user: updatedForm.user,
    }
      saveFormStructure(payload);
    }
  });

  context.uiStage.addRoot(editor);
  context.uiStage.setActiveRoot('formEditor');
  context.pipeline.invalidate();
});


system.eventBus.on('viewResults', async (form) => {
  console.log('Viewing results for form:', form);
  const results = await fetchFormResults(form.id);
  const resultsOverlay = new UIFormResults({
    form,
    results,
    context,
    layoutManager,
    layoutRenderer,   
  });
  context.uiStage.addRoot(resultsOverlay);
  context.uiStage.setActiveRoot('formResults');
  context.pipeline.invalidate();
});

system.eventBus.on('viewForm', (formData) => {
  console.log('Viewing form data:', formData);
 const formi = new ViewForm({
    id: `viewForm-${Date.now()}`,
    context,
    layoutManager,
    layoutRenderer,
    form: formData,
    onSubmit: (form) => {
      system.eventBus.emit('formSubmitted', { form});
    }
 });
  context.uiStage.addRoot(formi);
  context.uiStage.setActiveRoot(formi.id);
  context.pipeline.invalidate();
});

system.eventBus.on('formSubmitted', ({ form }) => {
  sendLog('Form submitted:', form);
  onMessageResponse(({ success, result, error }) => {
    if (success) {
      const overlay = new UIOverlay({
        context,
        layoutManager: context.uiStage.layoutManager,
        layoutRenderer: context.uiStage.layoutRenderer
      });
      
      context.uiStage.overlayRoot = overlay;
      
      overlay.showMessage({
        text: '✅ Form submitted successfully!',
        color: '#0a0',
        duration: 3000
      });
    } else {
      const overlay = new UIOverlay({
        context,
        layoutManager: context.uiStage.layoutManager,
        layoutRenderer: context.uiStage.layoutRenderer
      });
      
      context.uiStage.overlayRoot = overlay;
      
      overlay.showMessage({
        text: `❌ Error submitting form: ${error}`,
        color: '#a00',
        duration: 5000
      });
    }
  
  });
  
});



function launchFormPanel({layoutManager,
  layoutRenderer, context,manifest, pluginRegistry, emitFeedback}) {
    const formPanel = new FormPanel({
      layoutManager,
      layoutRenderer,
      context,
      manifest,
      pluginRegistry,
      onSubmit: (formData) => {
        console.log('Form submitted:', formData);
        // Handle form submission logic here
        emitFeedback( {
          success: true,
          text: "Form submitted successfully ✅",
          box: formPanel
        });
        onClose: () => {
          context.pipeline.remove(formPanel);
          context.uiStage.setActiveRoot(''); // or switch to another root as needed
          context.pipeline.invalidate();
        }
      }
    });
    context.uiStage.addRoot(formPanel);
    context.uiStage.setActiveRoot('formPanel');
context.pipeline.invalidate();
}

function launchCreateForm({
  layoutManager,
  layoutRenderer,
  context,
  manifest,
  saveFormStructure
}) {
  const createForm = new CreateForm({
    layoutManager,
    layoutRenderer,
    context,
    manifest,
    onSubmit: () => {
      const fields = manifest.fields.map(field => {
        const component = createForm.fieldComponents.get(field.id);
        if (component instanceof UIInputBox) {
          return {
            ...field,
            placeholder: component.placeholder
          };
        }
        return field;
      });
console.log('Fields after submission:', fields);
      const layout = Object.fromEntries(
        Array.from(createForm.fieldComponents).map(([id]) => [
          id,
          createForm.layoutManager.getLogicalBounds(id)
        ])
      );

      const payload = {
        id: manifest.id || `form-${Date.now()}`,
        label: manifest.label || 'Untitled Form',
        user: 'admin',
        formStructure: { fields, layout }
      };

      console.log('Form submitted with payload:', payload);
      saveFormStructure(payload);
    }
  });

  context.uiStage.addRoot(createForm);
  context.uiStage.setActiveRoot('createForm');
  context.pipeline.invalidate();
}

const trialManifest = 
  {
    label: 'new form',
    fields: [],
    id: `form-${Date.now()}`,
    mode: 'create',
  }

// launchCreateForm({
//   layoutManager,
//   layoutRenderer,
//   context,
//   manifest: trialManifest,
//   saveFormStructure
// });


// const formPanel = new FormPanel({
//   layoutManager,
//   layoutRenderer,
//   context,
//   manifest: discussionFeedbackFormManifest,
//   pluginRegistry: pluginRegistry,
//   onSubmit: (formData) => {
//     console.log('Form submitted:', formData);
//     // Handle form submission logic here
//     emitFeedback( {
//       success: true,
//       text: "Form submitted successfully ✅",
//       box: formPanel
//     });
//     onClose: () => {
//       context.pipeline.remove(formPanel);
//       context.uiStage.setActiveRoot(''); // or switch to another root as needed
//       context.pipeline.invalidate();
//     }
//   }
// });
// context.uiStage.addRoot(formPanel);
// context.uiStage.setActiveRoot('formPanel');

// registerFieldTypes();

// const display = fetchAllForms('admin').then(({user,forms}) => {
//   const allFormsPanel = new AllForms({
//     user,
//     forms,
//     layoutManager,
//     layoutRenderer,
//     onCreateForm: () => {
// launchCreateForm({
//         layoutManager,
//         layoutRenderer,
//         context,
//         manifest: blankFormManifest,
//         saveFormStructure
//       });
//     },
//     onViewForm: (form) => {
//       const mani = normalizeFormManifest(form);
//       launchFormPanel({layoutManager,
//         layoutRenderer, context,manifest:mani, pluginRegistry,
//         emitFeedback});
//     }
//   });
//   context.uiStage.addRoot(allFormsPanel);
//  // context.uiStage.setActiveRoot(allFormsPanel.id)
//   context.pipeline.invalidate();
// }).catch(err => {
//   console.error('Error fetching forms:', err);
// });

// const results = fetchFormResults('msg-1762771379271', 'faithandbelief').then(data => {
//   const resultsPanel = new ResultsPanel({
//     results: data,
//     layoutManager,
//     layoutRenderer
//   });
//   context.uiStage.addRoot(resultsPanel);
//  // context.uiStage.setActiveRoot(resultsPanel.id)
//   context.pipeline.invalidate();
// }).catch(err => {
//   console.error('Error fetching form results:', err);
// });


  // const loginPlugin = new LoginPlugin({
  //   layoutManager,
  //   layoutRenderer,
  //   eventBus: system.eventBus,
  //   editorController: context.textEditorController,
  //   onLogin: () => {
  //     localStorage.setItem('isLoggedIn', 'true');
  //     transitionToAdminMode();
  //     context.pipeline.invalidate();
  //   }
  // });

  // uiStage.addRoot(loginPlugin);
  // uiStage.setActiveRoot(loginPlugin.id);
  // loginPlugin.registerHitRegions(context.hitRegistry);


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
 

 