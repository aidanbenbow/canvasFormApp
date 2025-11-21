
import { ManifestUI } from './manifestUI.js';
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';

export const dashboardUIManifest = {
  containers: [
    {
      idSuffix: 'container',
      type: 'container',
      layout: { x: 10, y: 20, width: 200, height: 300 },
      scroll: true,
      assignTo: 'uiContainer'
    },
    {
      idSuffix: 'formsContainer',
      type: 'container',
      layout: { x: 300, y: 20, width: 280, height: 500 },
      scroll: true,
      assignTo: 'formsContainer'
    }
  ],
  buttons: [
    {
      idSuffix: 'viewBtn',
      label: 'View',
      type: 'button',
      action: (dashboard) => {
        if (dashboard.selectedForm) {
          dashboard.onCreateForm(dashboard.selectedForm);
        } else {
          console.log('No form selected to view.');
        }
      }
    },
    {
      idSuffix: 'resultsBtn',
      label: 'Results',
      type: 'button',
      action: (dashboard) => {
        if (dashboard.selectedForm) {
          dashboard.onViewResults(dashboard.selectedForm);
        } else {
          console.log('No form selected to view results.');
        }
      }
    },
    {
      idSuffix: 'createEditBtn',
      label: 'Create/Edit',
      type: 'button',
      action: (dashboard) => {
        dashboard.onEditForm(dashboard.selectedForm || null);
      }
    }
  ]
};

export class DashBoardScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store }) {
    super({ id:'dashboard', context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.manifestUI = new ManifestUI({ id: 'dashboardUI', context, layoutManager: this.context.uiStage.layoutManager, layoutRenderer: this.context.uiStage.layoutRenderer });
    this.buildUI();
this.rootElement.addChild(this.manifestUI);
    this.listenEvent('forms:updated', (forms) => {
      this.forms = forms;
      this.buildLayout();
      this.context.pipeline.invalidate();
    } );
  }

  buildUI() {
    this.manifestUI.buildContainersFromManifest(dashboardUIManifest.containers);
    this.manifestUI.buildChildrenFromManifest(dashboardUIManifest.buttons, this.manifestUI.uiContainer);
  }

  onEnter() {
    this.buildLayout();
  }

  buildLayout() {
    this.manifestUI.displayFormsLabels(this.store.getForms(), this.manifestUI.formsContainer, {
      onSelectForm: (form) => this._onSelect(form)
    });
  }

  _onSelect(form) {
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

_onCreateEdit() {
  const active = this.store.getActiveForm();
  this.dispatcher.dispatch(ACTIONS.FORM.EDIT, active || null, this.namespace);
}

}


