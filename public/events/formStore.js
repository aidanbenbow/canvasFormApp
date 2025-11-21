import { ACTIONS } from "./actions.js";

export class FormStore {
    constructor(dispatcher, eventBusManager, namespace='formStore') {
      this.dispatcher = dispatcher;
      this.eventBusManager = eventBusManager;
      this.namespace = namespace;

        this.state = {
            forms: [],
            activeForm: null
        };

        dispatcher.on(ACTIONS.FORM.SET_LIST,(forms)=>{
            this._setList(forms);
        }, this.namespace);

        dispatcher.on(ACTIONS.FORM.SET_ACTIVE,(form)=>{
            this._setActive(form);
        }, this.namespace);

        dispatcher.on(ACTIONS.FORM.UPDATE,(updatedForm)=>{
            this._update(updatedForm);
        }, this.namespace);

        dispatcher.on(ACTIONS.FORM.ADD,(form)=>{
            this._add(form);
        }, this.namespace);
    }
    _setList(forms){
        this.state = {...this.state, forms: Array.isArray(forms)? [...forms] : []};
        this._emitForms();
    }
_setActive(form){
        this.state = {...this.state, activeForm: form || null};
        this._emitActiveForm();
    }

    _add(form){
        this.state = {...this.state, forms: [...this.state.forms, form]};
        this._emitForms();
    }

    _update(updatedForm){
        this.state= {
            ...this.state,
            forms: this.state.forms.map(form=>
                form.id === updatedForm.id ? updatedForm : form
            )
        }
        this._emitForms();
        if(this.state.activeForm && this.state.activeForm.id === updatedForm.id){
            this.state = {
                ...this.state,
                activeForm: updatedForm
            }
            this._emitActiveForm();
        }
    }

    getForms(){
        return this.state.forms.slice();
    }
    getActiveForm(){
        return this.state.activeForm;
    }
    onFormsUpdated(handler, namespace='ui'){
        this.eventBusManager.on(ACTIONS.STORE.FORM_FORMS, handler, namespace);
    }

    onActiveFormChanged(handler, namespace='ui'){
        this.eventBusManager.on(ACTIONS.STORE.FORM_ACTIVE, handler, namespace);
    }

    _emitForms(){
        this.eventBusManager.emit(ACTIONS.STORE.FORM_FORMS, {forms: this.getForms()});
    }
    _emitActiveForm(){
        this.eventBusManager.emit(ACTIONS.STORE.FORM_ACTIVE, {activeForm: this.getActiveForm()});
    }

    destroy(){
        this.dispatcher.clear(this.namespace);
        this.eventBusManager.clearNamespace(this.namespace);
    }
  }