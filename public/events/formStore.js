import { Actions } from "./actions.js";

export class FormStore {
    constructor(dispatcher, namespace='formStore') {
      this.dispatcher = dispatcher;
      this.namespace = namespace;

        this.state = {
            forms: [],
            activeForm: null
        };

        dispatcher.on(Actions.FORM.SET_LIST,(forms)=>{
            this.state.forms = [...forms];
            this._emit('forms');
        }, this.namespace);

        dispatcher.on(Actions.FORM.SET_ACTIVE,(form)=>{
            this.state.activeForm = form;
this._emit('activeForm');
        }, this.namespace);

        dispatcher.on(Actions.FORM.UPDATE,(updatedForm)=>{
            this.state.forms = this.state.forms.map(form=>
                form.id === updatedForm.id ? updatedForm : form
            );
            this._emit('forms');
        }, this.namespace);

        dispatcher.on(Actions.FORM.ADD,(form)=>{
            this.state.forms = [...this.state.forms, form];
            this._emit('forms');
        }, this.namespace);
    }
    getForms(){
        return this.state.forms;
    }
    getActiveForm(){
        return this.state.activeForm;
    }
    _emit(type){
        this.dispatcher.dispatch(`STORE/FORM/${type.toUpperCase()}`, {[type]: this.state[type]}, this.namespace);
    }
  }