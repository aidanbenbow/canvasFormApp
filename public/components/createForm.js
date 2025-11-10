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
    this.formLabel = manifest.label || 'new form';
    this.onSubmit = onSubmit;

    this.fieldComponents = new Map();
    this.buildUI();
    this.buildFromManifest();
  }

  buildUI() {
    this.layoutManager.place({ id: `${this.id}-addComponent`, x: 20, y: 140, width: 200, height: 40 });
    const addComponentButton = new UIButton({
      id: `${this.id}-addComponent`,
      label: 'Add Component',
      onClick: () => {
        // Logic to add a new component dynamically
        const newField = {
          id: `input-${Date.now()}`,
          type: 'input',
          label: 'New Input',
          layout: { x: 225, y: 200 + this.fieldComponents.size * 65, width: 450, height: 60 }
        };
        this.manifest.fields.push(newField);
      this.addChild(new UIInputBox({
        id: newField.id,
        editorController: this.editorController,
        placeholder: '',
        label: newField.label,
        interactive: false
      }));
      this.layoutManager.place({ id: newField.id, ...newField.layout });
      this.fieldComponents.set(newField.id, this.children[this.children.length - 1]);
      this.context.pipeline.invalidate();
      }
    });
    this.addChild(addComponentButton);

  }

  buildFromManifest() {

    this.manifest.fields.forEach(field => {
      const { id, type, label, placeholder, layout } = field;
console.log(layout);
      let component;
      if (type === 'input' || type === 'textarea') {
        component = new UIInputBox({
          id,
          editorController: this.editorController,
          placeholder: placeholder || '',
          label: label || '',
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

  addCompenent(field) {
    // Implementation for adding a new component dynamically if needed

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
          child.label = newText;
          this.manifest.fields = this.manifest.fields.map(field => {
            if (field.id === child.id) {
              return { ...field, label: newText };
            }
            return field;
          });
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

