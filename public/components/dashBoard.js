
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';
import { buildDashboardManifest } from './manifests/dashboardManifest.js';
import { bindList } from '../state/reactiveStore.js';
import { compileUIManifest } from './uiManifestCompiler.js';
import { bindCommands } from './commandBinder.js';

export class DashBoardScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry }) {
    super({ id:'dashboard', context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.factories = factories;
    this.namespace = 'dashboard';
    this.dispatcher = dispatcher;
    this.commandRegistry = commandRegistry;

    this.manifest = buildDashboardManifest();

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
    this.unsubActive?.();
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


