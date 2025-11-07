import { UIElement } from './UiElement.js';

import { UIButton } from './button.js';
import { UIInputBox } from './inputBox.js';
import { PlaceholderPromptOverlay } from './placeHolderOverlay.js';
import { UIText } from './text.js';

export class CreateForm extends UIElement {
  constructor({ id = 'createForm', layoutManager, layoutRenderer, context, manifest, onSubmit }) {
    super({ id, layoutManager, layoutRenderer });
    this.context = context;
    this.editorController = context?.textEditorController;
    this.manifest = manifest;
    this.onSubmit = onSubmit;

    this.fieldComponents = new Map();
    this.buildFromManifest();
  }

  buildFromManifest() {
    this.manifest.fields.forEach(field => {
      const { id, type, label, placeholder, layout } = field;

      let component;
      if (type === 'input' || type === 'textarea') {
        component = new UIInputBox({
          id,
          editorController: this.editorController,
          placeholder: placeholder || label,
          interactive: false
        });
      } else if (type === 'button') {
        component = new UIButton({
          id,
          label,
          onClick: () => this.handleSubmit()
        });
      } else if (type === 'text') {
        component = new UIText({
          id,
          text: label,
          fontSize: 0.03,
          color: '#333'
        });
      }

      if (component) {
        this.addChild(component);
        this.layoutManager.place({ id, ...layout });
        this.fieldComponents.set(id, component);
      }
    });
  }

  handleSubmit() {
    const updatedFields = this.manifest.fields.map(field => {
      const component = this.fieldComponents.get(field.id);
      if (component instanceof UIInputBox) {
        return {
          ...field,
          placeholder: component.placeholder
        };
      }
      return field;
    });

    const updatedManifest = {
      ...this.manifest,
      fields: updatedFields
    };

    this.onSubmit?.(updatedManifest);
  }

  onChildEvent(event, child) {
    if (
      event.type === 'click' &&
      child instanceof UIInputBox &&
      child.interactive === false
    ) {
      const overlay = new PlaceholderPromptOverlay({
        targetBox: child,
        layoutManager: this.layoutManager,
        layoutRenderer: this.layoutRenderer,
        context: this.context,
        onConfirm: newText => {
          child.placeholder = newText;
          this.context.pipeline.invalidate();
        }
      });

      this.context.uiStage.overlayRoot = overlay;
      overlay.registerHitRegions(this.context.hitRegistry);
      this.context.pipeline.invalidate();
      return true;
    }

    return super.onChildEvent?.(event, child);
  }
}

// export class CreateForm extends UIElement {
//   constructor({ id = 'createForm', layoutManager, layoutRenderer,context, onSubmit }) {
//     super({ id, layoutManager, layoutRenderer });
//     this.onSubmit = onSubmit;
// this.editorController = context?.textEditorController;
// this.context = context;
// this.formStructure = [];
// this.formLabel = 'new form';
//     this.buildLayout();
//     this.buildUI();
//   }

//   buildLayout() {
//     this.layoutManager.place({ id: `${this.id}-title`, x: 20, y: 20, width: 200, height: 40 });
//     this.layoutManager.place({ id: `${this.id}-addInput`, x: 240, y: 20, width: 200, height: 40 });
//     this.layoutManager.place({ id: `${this.id}-labelInput`, x: 20, y: 140, width: 200, height: 40 });
//     this.layoutManager.place({ id: `${this.id}-submitButton`, x: 480, y: 20, width: 100, height: 40 });
//   }

//   buildUI() {
//     this.addChild(new UIText({
//       id: `${this.id}-title`,
//       text: 'Create New Form',
//       fontSize: 0.03,
//       color: '#333',
//       align: 'left',
//       valign: 'top'
//     }));

//     const labelInput = new UIInputBox({
//       id: `${this.id}-labelInput`,
//       editorController: this.editorController,
//       placeholder: 'Form Label',
//       onChange: value => { this.formLabel = value; }
//     });

//     const addInputButton = new UIButton({
//         id: `${this.id}-addInput`,
//         label: 'Add Input Field',
//         onClick: () => {
//             const inputField = new UIInputBox({
//             id: `${this.id}-inputField-${Date.now()}`,
//             editorController: this.editorController,
//             placeholder: 'Input Field',
//             interactive:false
//             });
//             this.addInputBox(inputField);
//         }
//         });

//     const submitButton = new UIButton({
//       id: `${this.id}-submitButton`,
//       label: 'Create',
//       onClick: () => {
//         console.log('Submitting form with label:', this.formStructure);
//         if (this.formLabel?.trim()) {
//           const newForm = {
//             label: this.formLabel,
//             id: `form-${Date.now()}`,
//             user: 'admin',
//             formStructure: this.formStructure
//           };
//           this.onSubmit?.(newForm);
//         }
//       }
//     });

//     this.addChild(addInputButton);
//     this.addChild(submitButton);
//   }

//   registerHitRegions(hitRegistry) {
//     this.children.forEach(child => {
//       hitRegistry.register(`${child.id}`, {
//         plugin: this,
//         region: 'button',
//         box: child
//       });
//     });
//   }

//   addInputBox(inputBox) {
//     this.addChild(inputBox);
//     const nextY = this.calculateNextY(); // your own logic
// this.layoutManager.place({
//   id: inputBox.id,
//   x: 20,
//   y: nextY,
//   width: 200,
//   height: 40
// });
// this.formStructure.push({ type: 'input', id: inputBox.id, placeholder: inputBox.placeholder, layout: { x: 20, y: nextY, width: 200, height: 40 } });
//     this.context.pipeline.invalidate();
//   }
//   calculateNextY() {
//     let maxY = 140; // starting Y after title and label input
//     this.children.forEach(child => {
//       const bounds = this.layoutManager.getLogicalBounds(child.id);
//       if (bounds && bounds.y != null && bounds.height != null) {
//         const bottom = bounds.y + bounds.height;
//         if (bottom > maxY) {
//           maxY = bottom;
//         }
//       }
//     });
//     return maxY + 20; // add spacing
//   }
//   // In CreateForm.js
//   onChildEvent(event, child) {
//     if (
//       event.type === 'click' &&
//       child instanceof UIInputBox &&
//       child.interactive === false
//     ) {
//       const overlay = new PlaceholderPromptOverlay({
//         targetBox: child,
//         layoutManager: this.layoutManager,
//         layoutRenderer: this.layoutRenderer,
//         context: this.context,
//         onConfirm: newText => {
//           child.placeholder = newText;
//           this.context.pipeline.invalidate();
//         }
//       });
  
//       this.context.uiStage.overlayRoot = overlay;
//       overlay.registerHitRegions(this.context.hitRegistry);
//       this.context.pipeline.invalidate();
//       return true;
//     }
//     return super.onChildEvent?.(event, child);
//   }
  
  
// }
