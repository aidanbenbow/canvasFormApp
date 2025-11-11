import { AllForms } from "./components/allForms.js";
import { CreateForm } from "./components/createForm.js";
import { Dashboard } from "./components/dashBoard.js";
import { FormEditor } from "./components/formEditor.js";
import { FormPanel } from "./components/formPanel.js";
import { UIFormResults } from "./components/formResults.js";
import { UIInputBox } from "./components/inputBox.js";
import { PopupKeyboard } from "./components/keyBoard.js";
import { ResultsPanel } from "./components/resultsPanel.js";
import { canvasConfig, createPluginManifest } from "./constants.js";
import { DragController } from "./controllers/dragController.js";
import { emitFeedback, fetchAllForms, fetchFormResults, loadFormStructure, saveFormStructure, sendLog } from "./controllers/socketController.js";
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



// const createForm = new CreateForm({
//   layoutManager,
//   layoutRenderer,
//   context,
//   manifest: discussionFeedbackFormManifest,
//   onSubmit: () => {
//    const fields = discussionFeedbackFormManifest.fields.map(field => {
//     const component = createForm.fieldComponents.get(field.id);
//     if( component instanceof UIInputBox) {
//       return {
//         ...field,
//         placeholder: component.placeholder
//       };
//     } return field;
//     }
//     )
//     const layout = Object.fromEntries(Array.from(createForm.fieldComponents).map(([id]) => [
//       id,
//       createForm.layoutManager.getLogicalBounds(id)
//     ]));
//     const payload = {
//       id: createForm.manifest.id || `form-${Date.now()}`,
//       label: createForm.manifest.label || 'Untitled Form',
//       user: 'admin',
//       formStructure: { fields, layout }
//     }
// console.log('Form submitted with payload:', payload);
//     saveFormStructure(payload);
//   }
// });
//  context.uiStage.addRoot(createForm);
//  context.uiStage.setActiveRoot('createForm');

// const formy = loadFormStructure('discussionFeedbackForm', (data) => {
//   console.log('Form structure loaded:', data);
//   const { layout, fields } = data.formData.formStructure;
//   const form = new FormPanel({
//     layoutManager,
//     layoutRenderer,
//     context,
//     manifest: {
//       id: data.formData.id,
//       label: data.formData.label,
//       fields: fields,
//       layout: layout
//     },
//     pluginRegistry: pluginRegistry,
//     onSubmit: (formData) => {
//       sendLog(formData.id, formData,fields);
//       // Handle form submission logic here
//       emitFeedback( {
//         success: true,
//         text: "Form submitted successfully ✅",
//         box: form
//       })},
//       onClose: () => {
//         context.pipeline.remove(form);
//         context.uiStage.setActiveRoot(''); // or switch to another root as needed
//         context.pipeline.invalidate();
//       }
//   });
//   context.uiStage.addRoot(form);
//   context.uiStage.setActiveRoot('formPanel');
//   context.pipeline.invalidate();
// });

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

const normalizeFormManifest = (form) => {
  const inputs = form.inputs || {};
  return {
    id: inputs.id || form.id || `form-${Date.now()}`,
    label: inputs.label || 'Untitled Form',
    user: inputs.user || 'admin',
    mode: 'results',
    layout: {
      title: { x: 20, y: 20, width: 300, height: 40 }
    },
    fields: (inputs.fields || []).map(field => ({
      ...field,
      layout: field.layout || { width: 300, height: 40 }
    }))
  };
};

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

registerFieldTypes();

const display = fetchAllForms('admin').then(({user,forms}) => {
  const allFormsPanel = new AllForms({
    user,
    forms,
    layoutManager,
    layoutRenderer,
    onCreateForm: () => {
launchCreateForm({
        layoutManager,
        layoutRenderer,
        context,
        manifest: blankFormManifest,
        saveFormStructure
      });
    },
    onViewForm: (form) => {
      const mani = normalizeFormManifest(form);
      launchFormPanel({layoutManager,
        layoutRenderer, context,manifest:mani, pluginRegistry,
        emitFeedback});
    }
  });
  context.uiStage.addRoot(allFormsPanel);
  context.uiStage.setActiveRoot(allFormsPanel.id)
  context.pipeline.invalidate();
}).catch(err => {
  console.error('Error fetching forms:', err);
});

const results = fetchFormResults('msg-1762771379271', 'faithandbelief').then(data => {
  const resultsPanel = new ResultsPanel({
    results: data,
    layoutManager,
    layoutRenderer
  });
  context.uiStage.addRoot(resultsPanel);
 // context.uiStage.setActiveRoot(resultsPanel.id)
  context.pipeline.invalidate();
}).catch(err => {
  console.error('Error fetching form results:', err);
});


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

//   const dashboardOverlay = new Dashboard({
//     forms: data,
//     layoutManager,
//     layoutRenderer,
//     onCreateForm: () => {
//       system.eventBus.emit('createForm');
//     },
//     onEditForm: (form) => {
//      //console.log('Emitting editForm for:', form);
//      system.eventBus.emit('editForm', form);
//     },
//     onViewResults: (form) => {
//       system.eventBus.emit('viewResults', form);
//     }
//   });
//   uiStage.addRoot( dashboardOverlay);
//   uiStage.setActiveRoot('dashboard');
// dashboardOverlay.registerHitRegions(context.hitRegistry);

// const dragController = new DragController({ canvas: mainCanvas,hitManager: context.hitManager, layoutManager, pipeline: context.pipeline,
// getMousePos: utilsRegister.get('mouse', 'getMousePosition'),
// normalisePos: utilsRegister.get('normalise', 'normalizePos') });

// context.dragController = dragController;

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
 // system.eventBus.emit('createForm');

  system.eventBus.on('editForm', (form) => {
    console.log('Editing form:', form);
    const editor = new FormEditor({
      layoutManager,
      layoutRenderer,
      context,
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
  
    uiStage.addRoot(editor);
    uiStage.setActiveRoot('formEditor');
  });
  
 // system.eventBus.emit('editForm', raw[3]);

  system.eventBus.on('viewResults', async (form) => {
    console.log('Viewing results for form:', form);
    const results = await fetchFormResults(form.id);
    const resultsOverlay = new UIFormResults({
      layoutManager,
      layoutRenderer,
      form,
      results
    });

    uiStage.addRoot(resultsOverlay);
    uiStage.setActiveRoot('formResults');
  });

  system.eventBus.on('modeChanged', (newMode) => {
    boxEditor.setMode(newMode);
   
    context.pipeline.invalidate();
  });

  system.eventBus.on('formResultsUpdated', () => {
    context.pipeline.invalidate();
  });

  let activeKeyboard = null;


  // system.eventBus.on('showKeyboard', ({ box, field }) => {
  //   if (activeKeyboard) {
  //     uiStage.getActiveRoot().removeChild(activeKeyboard);
  //    // uiRegistry.remove(activeKeyboard);
  //     activeKeyboard = null;
  //   }
  
  //   const keyboard = new PopupKeyboard({
  //     layoutManager,
  //     layoutRenderer,
  //     editorController: context.textEditorController,
  //     targetBox: box,
  //     targetField: field,
  //   });
 
    
    
  //  uiStage.getActiveRoot().addChild(keyboard);
  //   activeKeyboard = keyboard;
  //   context.pipeline.invalidate();
  // });
  
  
  
  // system.eventBus.on('hideKeyboard', () => {
  //   if (activeKeyboard) {
  //     adminOverlay.unregister(activeKeyboard);
  //     context.pipeline.remove(activeKeyboard);
  //     activeKeyboard = null;
  //   }
  //   if (modeState.current !== 'admin') {
  //     adminCanvas.style.pointerEvents = 'none';
  //   }
  //   context.pipeline.invalidate();
  // });
  
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

export async function init(data) {
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

// utilsRegister.on('onRegister', (ns, name, fn) => {
//     console.log(`[UTILS] Registered ${name} in ${ns}`);
//   });

 // let studentCount = 0;
// const messagePlugin = adminOverlay.plugins.find(p => p.type === 'messageOverlay');
// if (messagePlugin) {
//   messagePlugin.setLiveMessage(() => `👥 Students: ${studentCount}`, { x: 20, y: 160 });
// }

// system.eventBus.on('updateStudentCount', (count) => {
//   studentCount = count;
//   context.pipeline.invalidate();
// });


// export function setupAdminPlugins({ adminOverlay, hitRegistry, hitCtx, logicalWidth, boxEditor, renderer }) {
  
//  let saveButtonPlugin = new SaveButtonPlugin({
//     ctx: adminCtx,
//     logicalWidth,
//     boxes: boxEditor,
//     onSave: async (boxes) => {
//       const formStructure = boxes
//         .filter(box => ['textBox', 'inputBox', 'imageBox'].includes(box.type))
//         .map(box => box.serialize());
    
//         if (formStructure.length === 0) {
//           emitFeedback( {
//             success: false,
//             text: "Nothing to save ❌",
//             box: saveButtonPlugin
//           });
//           return;
//         }
//         const payload = {
//           id: boxEditor.formMeta.id||`form-${Date.now()}`,
//           formStructure,
//           label: boxEditor.formMeta.label||'Untitled Form',
//           resultsTable: boxEditor.formMeta.resultsTable||'cscstudents'
//         };
      
//       saveFormStructure(payload, saveButtonPlugin);
//       }
//   });


//   const addInputPlugin = new AddBoxPlugin({
//     ctx: adminCtx,
//     logicalWidth,
//     boxEditor,
//     renderer,
//     boxType: 'inputBox', 
//     yOffset: 50
//   });

//   const addTextPlugin = new AddBoxPlugin({
//     ctx: adminCtx,
//     logicalWidth,
//     boxEditor,
//     renderer,
//     boxType: 'textBox'
//   });

//   const addImagePlugin = new AddBoxPlugin({
//     ctx: adminCtx,
//     logicalWidth,
//     boxEditor,
//     renderer,
//     boxType: 'imageBox',
//     yOffset: 90
//   });
//   adminOverlay.register(addImagePlugin);
  

//   adminOverlay.register(saveButtonPlugin);
//   adminOverlay.register(addInputPlugin);
//   adminOverlay.register(addTextPlugin);

//   adminOverlay.registerHitRegions(hitRegistry);
//   adminOverlay.drawHitRegions(hitCtx);

//   return { saveButtonPlugin, addInputPlugin };
// }