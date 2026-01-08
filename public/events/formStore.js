import { normalizeForm } from "../plugins/formManifests.js";
import { ACTIONS } from "./actions.js";

export class FormStore {
    constructor(dispatcher, eventBusManager, namespace='formStore') {
      this.dispatcher = dispatcher;
      this.eventBusManager = eventBusManager;
      this.namespace = namespace;

        this.state = {
            forms: [],
            activeForm: null,
            results: {}
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

        dispatcher.on(ACTIONS.FORM.RESULTS_SET,( {formId, results} )=>{
            this._setResults(formId, results);
        }, this.namespace);

dispatcher.on(ACTIONS.FORM.ADD_RESULTS,( {formId, newResults} )=>{
            this._addResults(formId, newResults);
        }, this.namespace);

dispatcher.on(ACTIONS.FORM.DELETE,( formId )=>{
            this.removeForm(formId);
            
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
    _setResults(formId, results){
        this.state.results[formId] = results;
        this._emitResults(formId);
    }

_addResults(formId, newResults){
        if(!this.state.results[formId]){
            this.state.results[formId] = [];
        }
        this.state.results[formId] = [...this.state.results[formId], ...newResults];
        this._emitResults(formId);
    }
    _add(form){
        this.state = {...this.state, forms: [...this.state.forms, form]};
        this._emitForms();
    }

    _update(updatedForm){
        const formWithId = normalizeForm(updatedForm);
       let found = false;
       this.state.forms = this.state.forms.map(f => {
            if(f.id === formWithId.id){
                found = true;
                return formWithId;
            }
            return f;
        } );
        if(!found){
            this.state.forms = [...this.state.forms, formWithId];
        }
        this._emitForms();
        if(this.state.activeForm && this.state.activeForm.id === formWithId.id){
            this.state = {
                ...this.state,
                activeForm: formWithId
            }
            this._emitActiveForm();
        }
    }

    getForms(){
        return this.state.forms.slice();
    }
    getFormResults(formId){
        return this.state.results[formId] ? this.state.results[formId].slice() : [];
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

    _emitResults(formId){
        this.eventBusManager.emit(ACTIONS.STORE.FORM_RESULTS, { formId, results: this.getFormResults(formId) });
    }
    destroy(){
        this.dispatcher.clear(this.namespace);
        this.eventBusManager.clearNamespace(this.namespace);
    }
    _generateId(){
        return 'form-' + Math.random().toString(36).substr(2, 9);
    }
    removeForm(formId){
        this.state.forms = this.state.forms.filter(f => f.id !== formId);
        if(this.state.activeForm && this.state.activeForm.id === formId){
            this.state.activeForm = null;
            this._emitActiveForm();
        }
        this._emitForms();
    }
    subscribe(key, handler) {
        if (key === "forms") {
          return this.eventBusManager.on(
            ACTIONS.STORE.FORM_FORMS,
            ({ forms }) => handler({ forms }),
            "ui"
          );
        }
      
        if (key === "activeForm") {
          return this.eventBusManager.on(
            ACTIONS.STORE.FORM_ACTIVE,
            ({ activeForm }) => handler(activeForm),
            "ui"
          );
        }
      }
  }