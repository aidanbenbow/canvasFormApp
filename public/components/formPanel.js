import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';
import { UIInputBox } from './inputBox.js';
import { UIText } from './text.js';
import { PlaceholderPromptOverlay } from './placeHolderOverlay.js';
import { UITextArea } from './textArea.js';

export class FormPanel extends UIElement {
  constructor({ id = 'formPanel', layoutManager, layoutRenderer, context, manifest, pluginRegistry, onSubmit, onClose }) {
    super({ id, layoutManager, layoutRenderer });
    this.context = context;
    this.editorController = context?.textEditorController;
    this.manifest = manifest;
    this.pluginRegistry = pluginRegistry;
console.log(manifest);
    this.mode = manifest.mode || 'create';
    this.formLabel = manifest.label || '';
    this.fields = manifest.fields || [];
    this.onSubmit = onSubmit;
    this.onClose = onClose;

this.fieldComponents = {};

    this.buildLayout();
    this.buildUI();
  }

  buildLayout() {
    const layout = this.manifest.layout || {};
    Object.entries(layout).forEach(([key, config]) => {
      this.layoutManager.place({ id: `${this.id}-${key}`, ...config });
    });
    const titleBounds = this.layoutManager.getLogicalBounds(`${this.id}-title`);
    
    const flowStartY = titleBounds ? titleBounds.y + titleBounds.height + 20 : 80;
   // Flow all fields together
  this.flowLabeledFields(this.fields, { x: 20, y: flowStartY });

    } 
    

flowLabeledFields(fields, start = { x: 20, y: 80 }) {
    const labelHeight = 20;
    const spacing = 5;
    const pairSpacing = 15;
    const wrapperIds = []

    fields.forEach((field, index) => {
        const wrapperId = `${field.id}-wrapper`;
        const labelId = `${field.id}-label`;
        const inputHeight = field.layout.height;
        const pairHeight = labelHeight + spacing + inputHeight;
        this.layoutManager.place({
            id: wrapperId,
            x: start.x,
            y: 0,
            width: field.layout.width,
            height: pairHeight
        });
        wrapperIds.push(wrapperId);
    } );
    this.layoutManager.flow({
        direction: 'vertical',
        items: wrapperIds,
        spacing: pairSpacing,
        start,
        size: { width: fields[0].layout.width, 
            height: labelHeight + spacing + fields[0].layout.height }
    });
    fields.forEach(field => {
        const wrapperId = `${field.id}-wrapper`;
        const labelId = `${field.id}-label`;
        this.layoutManager.placeRelative({
            id: labelId,
            relativeTo: wrapperId,
            position: 'top',
            margin: 0,
            width: field.layout.width,
            height: labelHeight,
        });
        this.layoutManager.placeRelative({
            id: field.id,
            relativeTo: labelId,
            position: 'below',
            margin: spacing,
            width: field.layout.width,
            height: field.layout.height,
          
        });
    } );
}

  buildUI() {
    this.addChild(new UIText({
      id: `${this.id}-title`,
      text: this.mode === 'edit' ? `Edit: ${this.formLabel}` : this.mode === 'results' ? `Results for: ${this.formLabel}` : this.formLabel,
      fontSize: 0.03,
      color: '#333',
      align: 'left',
      valign: 'top'
    }));

    this.fields.forEach(field => {
        const labelId = `${field.id}-label`;

        if (field.type !== 'button') {
          this.addChild(new UIText({
            id: labelId,
            text: field.label || '',
            fontSize: 0.02,
            color: '#555',
            align: 'left',
            valign: 'top'
          }));
        }
      
        const fieldComponent = this.createFieldComponent(field);
        this.fieldComponents[field.id] = fieldComponent; // ✅ store reference
        console.log('Adding field component:', fieldComponent);
        this.addChild(fieldComponent); // ✅ add to UI
      });
}
  createFieldComponent(field) {
    const common = {
      id: field.id,
      layout: field.layout,
      editorController: this.editorController,
    };
  console.log(common, field.type)
    switch (field.type) {
      case 'button':
        return this.pluginRegistry?.createField('button', {
          ...common,
          label: field.label,
          onClick: () => {
            const filledFields = this.fields
              .filter(f => f.type !== 'button')
              .map(f => {
                const component = this.fieldComponents[f.id];
                const value = component?.getValue?.() ?? f.value ?? '';
                return { id: f.id, value };
              });
  
            const payload = {
              id: this.manifest.id || `form-${Date.now()}`,
              label: this.formLabel,
              fields: filledFields,
              user: 'admin'
            };
  
            this.mode === 'results' ? this.onClose?.() : this.onSubmit?.(payload);
          }
        }) || new UIButton({
          ...common,
          label: field.label,
          onClick: () => { const filledFields = this.fields
            .filter(f => f.type !== 'button')
            .map(f => {
              const component = this.fieldComponents[f.id];
              const value = component?.getValue?.() ?? f.value ?? '';
              return { id: f.id, value };
            });

          const payload = {
            id: this.manifest.id || `form-${Date.now()}`,
            label: this.formLabel,
            fields: filledFields,
            user: 'admin'
          };
            
            console.log('Form submitted with payload:', payload); }
        });
  
      case 'textarea':
        return this.pluginRegistry?.createField('textarea', {
          ...common,
          placeholder: field.placeholder,
          onChange: value => { field.value = value; }
        }) || new UITextArea({
          ...common,
          placeholder: field.placeholder,
          onChange: value => { field.value = value; }
        });
  
      case 'input':
      default:
        return this.pluginRegistry?.createField('input', {
          ...common,
          placeholder: field.placeholder,
          
          onChange: value => { field.value = value; }
        }) || new UIInputBox({
          ...common,
          placeholder: field.placeholder,
          
          onChange: value => { field.value = value; }
        });
    }
  }
  addInputBox(inputBox) {
    this.addChild(inputBox);
    const nextY = this.calculateNextY();
    this.layoutManager.place({ id: inputBox.id, x: 20, y: nextY, width: 200, height: 40 });
    this.formStructure.push({ type: 'input', id: inputBox.id, placeholder: inputBox.placeholder, layout: { x: 20, y: nextY, width: 200, height: 40 } });
    this.context.pipeline.invalidate();
  }

  calculateNextY() {
    let maxY = 140;
    this.children.forEach(child => {
      const bounds = this.layoutManager.getLogicalBounds(child.id);
      if (bounds?.y != null && bounds?.height != null) {
        maxY = Math.max(maxY, bounds.y + bounds.height);
      }
    });
    return maxY + 20;
  }

  onChildEvent(event, child) {
    if (event.type === 'click' && child instanceof UIInputBox && child.interactive === false) {
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

  registerHitRegions(hitRegistry) {
    this.children.forEach(child => {
      hitRegistry.register(child.id, {
        plugin: this,
        region: 'button',
        box: child
      });
    });
  }
}