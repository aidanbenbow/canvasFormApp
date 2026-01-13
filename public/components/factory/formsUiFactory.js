import { labelRenderer } from "../../renderers/nodeRenderers/labelRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { LabelNode } from "../nodes/labelNode.js";
import { BaseUIFactory } from "./baseUiFactory.js";

export class FormsUIFactory extends BaseUIFactory {
    constructor(context) {
        super(context);
    
        this.fieldRegistry = {
          text: this.createTextField.bind(this),
          input: this.createInputField.bind(this),
          formButton: this.createButtonField.bind(this)
        };
      }
    
      registerFieldType(type, factoryFn) {
        this.fieldRegistry[type] = factoryFn;
      }
      // createComponent(def, handlers = {}) {
      //   if (def.type in this.fieldRegistry) {
      //     return this.fieldRegistry[def.type](def, handlers);
      //   }
      //   return super.createComponent(def, handlers);
      // }
    
    createField(fieldDef, handlers) {
        const factoryFn = this.fieldRegistry[fieldDef.type];
        if (!factoryFn) {
            throw new Error(`Unknown field type: ${fieldDef.type}`);
        }
        return factoryFn(fieldDef, handlers);
        }   
        
        createTextField(fieldDef, handlers = {}) {
          const { onChange } = handlers;
        
          return super.create({
            id: `field-${fieldDef.id}`,
            type: "fieldContainer",
            label: fieldDef.label,
            children: [
              super.create({
                id: `input-${fieldDef.id}`,
                type: "text",
                placeholder: fieldDef.placeholder || "",
                onChange: value => onChange?.(fieldDef.id, value)
              }, handlers)
            ]
          }, handlers);
        }
        

      createInputField(fieldDef, handlers = {}) {
        const { onChange } = handlers;
      
        return super.create({
          id: `field-${fieldDef.id}`,
          type: 'fieldContainer',
          label: fieldDef.label,
          children: [
            super.create({
              id: `input-${fieldDef.id}`,
              type: 'input',
              placeholder: fieldDef.placeholder || '',
              onChange: value => onChange?.(fieldDef.id, value)
            }, handlers)
          ]
        }, handlers);
      }
      createButtonField(fieldDef, handlers = {}) {
        const { onSubmit } = handlers;
      
        return super.create({
          id: `field-${fieldDef.id}`,
          type: "fieldContainer",
          children: [
            super.create({
              id: `btn-${fieldDef.id}`,
              type: "button",
              label: fieldDef.label ?? "Submit",
              onClick: () => onSubmit?.()
            }, handlers)
          ]
        }, handlers);
      }
      
      createLabel(form, { selected, onSelect }) {
        const node = new LabelNode({
          id: `form-${form.id}`,
          text: form.label,
          selected,
          onSelect
        });
    
        node.renderStrategy = labelRenderer;
        node.hitTestStrategy = rectHitTestStrategy;
    
        return node;
      }
    
  
    createLabels(forms, opts) {
      return forms.map(form => this.createLabel(form, opts));
    }
  
    createFormView(formManifest, handlers) {
      console.log("Creating form view for manifest:", formManifest);
        const container = this.create({
          id: `form-${formManifest.id}`,
          type: 'container',
          layout: 'vertical'
        });
      
        const fields = formManifest.fields.map(field =>
          this.createField(field, handlers)
        );
      
        container.setChildren(fields);
      
        return container;
      }
  }