
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';
import { bindList } from '../state/reactiveStore.js';
import { compileUIManifest } from './uiManifestCompiler.js';
import { bindCommands } from './commandBinder.js';


const dashboardUIManifest = {
  layout: 'vertical',
  id: 'dashboard-root',
  style: {
    background: '#ffffff'
  },
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
      layout: 'horizontal',
      style: {
        background: '#f3f4f6',
        border: { color: '#d1d5db', width: 1 }
      },
      children: [
        { type: 'button', id: 'view', label: 'View', command: 'FORM_VIEW', style: { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 } },
        { type: 'button', id: 'results', label: 'Results', command: 'FORM_RESULTS', style: { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 } },
        { type: 'button', id: 'create', label: 'Create', command: 'FORM_CREATE', style: { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 } },
        { type: 'button', id: 'edit', label: 'Edit', command: 'FORM_EDIT', style: { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 } },
        { type: 'button', id: 'delete', label: 'Delete', command: 'FORM_DELETE', style: { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 } }
      ]
    },
    forms: {
      type: 'fieldContainer',
      children: []
    }
  }
};

export class DashBoardScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry }) {
    super({ id:'dashboard', context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.factories = factories;
    this.namespace = 'dashboard';
    this.dispatcher = dispatcher;
    this.commandRegistry = commandRegistry;

    this.manifest = dashboardUIManifest;

    bindCommands({
      manifest: this.manifest,
      commandRegistry: this.commandRegistry,
      dispatcher: this.dispatcher,
      store: this.store,
      namespace: this.namespace
    });
  }

  createRoot() {
    const { rootNode, regions } = compileUIManifest(
      this.manifest,
      this.factories,
      this.commandRegistry,
      this.context
    );

    this.regions = regions;
    this.rootNode = rootNode;

    return rootNode;
  }

  onEnter() {
    this.bindState();
    this.unsubActive = this.store.subscribe('activeForm', ({ activeForm }) => {
      const active = activeForm;
      for (const child of this.regions.forms.children) {
        const isSelected = child.id === (active ? `form-${active.id}` : null);
        const current = child.uiState?.selected ?? false;
        if (current !== isSelected) {
          child.setUIState?.({ selected: isSelected });
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


