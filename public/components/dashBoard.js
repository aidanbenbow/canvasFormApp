
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';

import { bindList } from '../state/reactiveStore.js';

import { compileUIManifest } from './uiManifestCompiler.js';
import { bindCommands } from './commandBinder.js';


const dashboardUIManifest = {
  layout: 'vertical',

  commands: {
    FORM_VIEW: {
      action: ACTIONS.FORM.VIEW,
      needsActive: true
    },
    FORM_RESULTS: {
      action: ACTIONS.FORM.RESULTS,
      needsActive: true
    },
    FORM_CREATE: {
      action: ACTIONS.FORM.CREATE,
      needsActive: false
    },
    FORM_EDIT: {
      action: ACTIONS.FORM.EDIT,
      needsActive: true
    },
    FORM_DELETE: {
      action: ACTIONS.FORM.DELETE,
      needsActive: true
    }
  },

  regions: {
    toolbar: {
      type: 'container',
      children: [
        {type: 'button', id: 'view', label: 'View', command: 'FORM_VIEW' },
        {type: 'button', id: 'results', label: 'Results', command: 'FORM_RESULTS' },
        { type: 'button', id: 'create', label: 'Create', command: 'FORM_CREATE' },
        { type: 'button', id: 'edit', label: 'Edit', command: 'FORM_EDIT' },
        { type: 'button', id: 'delete', label: 'Delete', command: 'FORM_DELETE' }
      ]
    },

    forms: {
      type: 'fieldContainer',
      bind: 'forms'
    }
  }
};

export class DashBoardScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry }) {
    super({ id:'dashboard', context, dispatcher, eventBusManager });
    this.store = store;
    console.log('activeform', store.getActiveForm());
    console.log('forms', store.getForms());
    this.context = context;
 this.factories = factories;
 this.namespace = 'dashboard';
 this.dispatcher = dispatcher;
    this.commandRegistry = commandRegistry;
    bindCommands({
      manifest: dashboardUIManifest,
      commandRegistry: this.commandRegistry,
      dispatcher: this.dispatcher,
      store: this.store,
      namespace: this.namespace
    });
    
  }

  createRoot() {
    const { rootNode, regions } = compileUIManifest(dashboardUIManifest, this.factories, this.commandRegistry);
    this.regions = regions;
    this.rootNode = rootNode;
    console.log("Dashboard root node created:", rootNode);
    return rootNode;
  }

  onEnter() {
    this.bindState();
    this.unsubActive = this.store.subscribe('activeForm', ({ activeForm }) => {
      const active = activeForm;
    console.log("Active form changed:", active);
      for (const child of this.regions.forms.children) {
        const isSelected = child.id === active?.id;
        if (child.state.selected !== isSelected) {
          child.state.selected = isSelected;
          console.log(`Form ${child.id} selection state changed to:`, isSelected);
          child.invalidate();
        }
      }
    });
   
  }

  onExit() {
    this.unsubForms?.();
  }

  bindState() {
    this.unsubForms = bindList({
      store: this.store,
      key: 'forms',
      container: this.regions.forms,
      factory: this.factories.formsUI,
      mapItem: (form) =>
  this.factories.formsUI.createLabel(form, {
    selected: form.id === this.store.getActiveForm()?.id,
    onSelect: () => {
      this.dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, form, this.namespace)

    }
      
  })
    });
  
  }

}


