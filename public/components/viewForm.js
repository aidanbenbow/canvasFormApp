import { UIElement } from "./UiElement.js";
import { createUIComponent } from "./createUIComponent.js";


export class ViewForm extends UIElement{
    constructor({ id, context, layoutManager, layoutRenderer, form, onSubmit }) {
        super({ id, context, layoutManager, layoutRenderer });
        this.form = typeof form === 'string' ? JSON.parse(form) : form;
        console.log('ViewForm initialized with form:', this.form);
        this.formContainer = null;
        this.onSubmit = onSubmit;
        this.buildUI();
        this.buildForm();
    }
    buildUI() {
        this.formContainer = createUIComponent({
            id: `${this.id}-formContainer`,
            type: 'container',
            layout: { x: 20, y: 20, width: 600, height: 400 }
        }, this.context);
        this.formContainer.initializeScroll();
        this.addChild(this.formContainer);
    }
    buildForm() {
       this.form.formStructure.fields.forEach(field => {
       if(field.type==='text') {
        const title = createUIComponent({
            id: field.id,
            type: 'text',
            label: field.label,
        }, this.context);
this.formContainer.addChild(title);
       }
       if(field.type==='input') {
        const inputBox = createUIComponent({
            id: field.id,
            type: 'input',
            label: field.label,
            placeholder: field.placeholder || '',

        }, this.context);
this.formContainer.addChild(inputBox);
         }
         if(field.type==='button') {
            const submitBtn = createUIComponent({
                id: field.id,
                type: 'button',
                label: field.label || 'Submit',
                onClick: () => this.onSubmit()
            }, this.context);
    this.formContainer.addChild(submitBtn);
            }
         }); }
    } 
