import { VerticalLayoutStrategy } from "../strategies/vertical.js";
import { UIElement } from "./UiElement.js";
import { BaseScreen } from "./baseScreen.js";
import { createUIComponent } from "./createUIComponent.js";
import { ManifestUI } from "./manifestUI.js";

export class FormViewScreen extends BaseScreen {
    constructor({ context, dispatcher, eventBusManager, store, factories, onSubmit }) {
      super({ id: 'form-view', context, dispatcher, eventBusManager });
  
      this.store = store;
      this.factories = factories;
      this.onSubmit = onSubmit;
    }
  
    onEnter() {
      this.build();
      this.layoutToCanvas();
    }
  
    build() {
      this.setLayoutStrategy(new VerticalLayoutStrategy());
  
      const activeForm = this.store.getActiveForm();
      const manifest = {
        id: activeForm.id,
        label: activeForm.label,
        fields: activeForm.formStructure?.fields ?? []
      };
    
      // 🔹 Ask the factory to build the form UI
      const formUI = this.factories.formsUI.createFormView(manifest, {
        onSubmit: this.onSubmit
      });
  
      // 🔹 Add to screen
      this.rootElement.setChildren([formUI]);
    }
  
    layoutToCanvas() {
      const canvas = this.context.canvas;
      this.layout(canvas.width, canvas.height);
    }
  }

// const formViewManifest = {
//     layout: 'vertical',
//    forms: {
//         idSuffix: 'formContainer',
//         type: 'container',
//         assignTo: 'formContainer'
//     }
// };

// export class ViewForm extends BaseScreen{
//     constructor({id, context, dispatcher, eventBusManager, store,factory,  onSubmit }) {
//         super({id, context, dispatcher, eventBusManager });
//         this.store = store;
//         this.onSubmit = onSubmit;
//         this.inputBoxes = new Map();
//         this.factory = factory;
//         this.buildUI();
//         this.rootElement.addChild(this.manifestUI);
//         this.buildLayout();
//     }
//     buildUI() {
//         this.manifestUI.buildContainersFromManifest(formViewManifest);
//     }
//     buildLayout() {
//         const activeForm = this.store.getActiveForm();
//         this.manifestUI.buildFormFromManifest(activeForm, this.manifestUI.formContainer, {
//             onSubmit: this.onSubmit
//         });
//           // 🔹 Immediately measure and lay out
//   const canvas = this.context.uiStage.layoutRenderer.canvas;
//   const w = canvas.width;
//   const h = canvas.height;
//   this.manifestUI.measure({ maxWidth: w, maxHeight: h });
//   this.manifestUI.layout(0, 0, w, h);

//     }

// }

