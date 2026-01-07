
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
        { id: 'view', label: 'View', command: 'FORM_VIEW' },
        { id: 'results', label: 'Results', command: 'FORM_RESULTS' },
        { id: 'create', label: 'Create', command: 'FORM_CREATE' },
        { id: 'edit', label: 'Edit', command: 'FORM_EDIT' },
        { id: 'delete', label: 'Delete', command: 'FORM_DELETE' }
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
    this.context = context;
 this.factories = factories;
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
    const { rootNode, regions } = compileUIManifest(dashboardUIManifest, this.factories);
    this.regions = regions;
    this.rootNode = rootNode;
    console.log("Dashboard root node created:", rootNode);
    console.log("Dashboard regions:", regions);
    return rootNode;
  }

  onEnter() {
    this.bindState();
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
    onSelect: f =>
      this.dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, f, this.namespace)
  })
    });
  }

}


