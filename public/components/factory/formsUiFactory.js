import { BaseUIFactory } from "./baseUiFactory.js";

export class FormsUIFactory extends BaseUIFactory {
    constructor(context) {
        super(context);
    
        this.fieldRegistry = {
          text: this.createTextField.bind(this),
          input: this.createInputField.bind(this),
          button: this.createButtonField.bind(this)
        };
      }
    
      registerFieldType(type, factoryFn) {
        this.fieldRegistry[type] = factoryFn;
      }
    createField(fieldDef, handlers) {
        const factoryFn = this.fieldRegistry[fieldDef.type];
        if (!factoryFn) {
            throw new Error(`Unknown field type: ${fieldDef.type}`);
        }
        return factoryFn(fieldDef, handlers);
        }   
        
    createTextField(fieldDef, { onChange }) {
        return this.create({
          id: `field-${fieldDef.id}`,
          type: 'fieldContainer',
          label: fieldDef.label,
          children: [
            this.create({
              id: `input-${fieldDef.id}`,
              type: 'text',
              placeholder: fieldDef.placeholder || '',
              onChange: (value) => onChange?.(fieldDef.id, value)
            })
          ]
        });
      }

      createInputField(fieldDef, { onChange }) {
        return this.create({
          id: `field-${fieldDef.id}`,
          type: 'fieldContainer',
          label: fieldDef.label,
          children: [
            this.create({
              id: `input-${fieldDef.id}`,
              type: 'input',
              placeholder: fieldDef.placeholder || '',
              onChange: (value) => onChange?.(fieldDef.id, value)
            })
          ]
        });
      }
      createButtonField(fieldDef, { onSubmit }) {
        return this.create({
          id: `field-${fieldDef.id}`,
          type: "fieldContainer",
          children: [
            this.create({
              id: `btn-${fieldDef.id}`,
              type: "button",
              label: fieldDef.label ?? "Submit",
              onClick: () => onSubmit?.()
            })
          ]
        });
      }
    createLabel(form, { onSelect }) {
      return this.create({
        id: `form-${form.id}`,
        type: 'button',
        label: form.label ?? `Form ${form.id}`,
        onClick: () => onSelect?.(form)
      });
    }
  
    createLabels(forms, opts) {
      return forms.map(form => this.createLabel(form, opts));
    }
  
    createFormView(formManifest, handlers) {
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