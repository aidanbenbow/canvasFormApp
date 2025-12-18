
import { ManifestUI, UIElementFactory } from './manifestUI.js';
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';
import { createUIComponent } from './createUIComponent.js';
import { VerticalLayoutStrategy } from '../strategies/vertical.js';

export const dashboardUIManifest = {
 
  buttons: [
    {
      idSuffix: 'viewBtn',
      label: 'View',
      type: 'button',
      action: (dashboard) => dashboard._onView(),
    },
    {
      idSuffix: 'resultsBtn',
      label: 'Results',
      type: 'button',
      action: (dashboard) => dashboard._onResults(),
    },
    {
      idSuffix: 'createBtn',
      label: 'Create',
      type: 'button',
      action: (dashboard) => dashboard._onCreate(),
    },
    {
      idSuffix: 'editBtn',
      label: 'Edit',
      type: 'button',
      action: (dashboard) => dashboard._onEdit(),
    },
    {
      idSuffix: 'deleteBtn',
      label: 'Delete',
      type: 'button',
      action: (dashboard) => {
        dashboard._onDelete();
      },
    }
  ]
};

export class DashBoardScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store }) {
    super({ id:'dashboard', context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.factory = new UIElementFactory({ context });
    this.uiContainer = createUIComponent({
      id: 'dashboardUIContainer',
      type: 'container',
    }, this.context,);
    this.formContainer = createUIComponent({
      id: 'dashboardFormContainer',
      type: 'fieldContainer',
      
    },this.context,);

    this.rootElement.addChild(this.uiContainer);
    this.rootElement.addChild(this.formContainer);
    const btns = this.factory.createButtons(dashboardUIManifest.buttons, this);
    for(const btn of btns){
      this.uiContainer.addChild(btn);
    }

    this.setLayoutStrategy(new VerticalLayoutStrategy());
  }

  onEnter() {
    this.buildLayout();
    const canvas = this.context.canvas
 this.layout(canvas.width, canvas.height);
  }

  buildLayout() {
  
    const formsBtns = this.factory.createFormLabels(this.store.getForms(), {onSelect: (form) => this._onSelect(form) });
  console.log(formsBtns);
    for (const btn of formsBtns) {
      this.formContainer.addChild(btn);
    }
    // 🔹 Now measure and layout the container with real constraints
  const canvas = this.context.uiStage.layoutRenderer.canvas;
  this.formContainer.measure({ maxWidth: canvas.width, maxHeight: canvas.height });
  this.formContainer.layout(0, 0, this.formContainer._measured.width, this.formContainer._measured.height);


  }

  _onSelect(form) {
console.log('Selected form:', form);  
    this.dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form, this.namespace);
}
_onView() {
  const active = this.store.getActiveForm();
  if(!active) return;
  this.dispatcher.dispatch(ACTIONS.FORM.VIEW, active, this.namespace);

}
_onResults() {
  const active = this.store.getActiveForm();
  if(!active) return;
  this.dispatcher.dispatch(ACTIONS.FORM.RESULTS, active, this.namespace);
}

_onCreate() {
  this.dispatcher.dispatch(ACTIONS.FORM.CREATE, null, this.namespace);
}
_onEdit() {
  const active = this.store.getActiveForm();
  if(!active) return;
  this.dispatcher.dispatch(ACTIONS.FORM.EDIT, active, this.namespace);
}
_onDelete() {
  const active = this.store.getActiveForm();
  if(!active) return;
  this.dispatcher.dispatch(ACTIONS.FORM.DELETE, active, this.namespace);
 
}

}


