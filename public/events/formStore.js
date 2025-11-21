export class FormStore {
    constructor(eventManager) {
      this.forms = [];
      this.activeForm = null;
      this.eventManager = eventManager;
    }
  
    setForms(forms) {
      this.forms = forms;
      this.eventManager.emit('forms:updated', this.forms);
    }
    getForms() {
        console.log('Getting forms:', this.forms);
        return this.forms;
        }
  
    addForm(form) {
      this.forms.push(form);
      this.eventManager.emit('forms:updated', this.forms);
    }
  
    setActiveForm(form) {
      this.activeForm = form;
      this.eventManager.emit('form:active', form);
    }
  
    updateForm(updatedForm) {
      this.forms = this.forms.map(f => f.id === updatedForm.id ? updatedForm : f);
      this.eventManager.emit('forms:updated', this.forms);
    }
  }