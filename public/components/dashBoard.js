
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';
import { createUIComponent } from './createUIComponent.js';
import { VerticalLayoutStrategy } from '../strategies/vertical.js';
import { bindList } from '../state/reactiveStore.js';


const dashboardUIManifest = {
  layout: 'vertical',

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
    this.registerCommands();
    
  }

  onEnter() {
    this.build(dashboardUIManifest);
    this.bindState();
    const canvas = this.context.canvas
 this.layout(canvas.width, canvas.height);
  }

  onExit() {
    this.unsubForms?.();
  }
  build(manifest) {
    this.setLayoutStrategy(new VerticalLayoutStrategy());

    this.regions = {};

    Object.entries(manifest.regions).forEach(([key, def]) => {
      const container = createUIComponent(
        { id: `dashboard-${key}`, type: def.type },
        this.context
      );

      this.rootElement.addChild(container);
      this.regions[key] = container;

      if (def.children) {
        container.setChildren(
          this.factories.commandUI.createButtons(def.children, this.commandRegistry)
        );
      }
    });
  }

  bindState() {
    this.unsubForms = bindList({
      store: this.store,
      key: 'forms',
      container: this.regions.forms,
      factory: this.factory,
      mapItem: (form) =>
  this.factories.formsUI.createLabel(form, {
    onSelect: f =>
      this.dispatcher.dispatch(ACTIONS.FORM.SET_ACTIVE, f, this.namespace)
  })
    });
  }

  _withActive(fn) {
    const active = this.store.getActiveForm();
    if (active) fn(active);
  }

  registerCommands() {
    this.commandRegistry.register("FORM_VIEW", () =>
      this._withActive(form =>
        this.dispatcher.dispatch(ACTIONS.FORM.VIEW, form, this.namespace)
      )
    );
  
    this.commandRegistry.register("FORM_RESULTS", () =>
      this._withActive(form =>
        this.dispatcher.dispatch(ACTIONS.FORM.RESULTS, form, this.namespace)
      )
    );
  
    this.commandRegistry.register("FORM_CREATE", () =>
      this.dispatcher.dispatch(ACTIONS.FORM.CREATE, null, this.namespace)
    );
  
    this.commandRegistry.register("FORM_EDIT", () =>
      this._withActive(form =>
        this.dispatcher.dispatch(ACTIONS.FORM.EDIT, form, this.namespace)
      )
    );
  
    this.commandRegistry.register("FORM_DELETE", () =>
      this._withActive(form =>
        this.dispatcher.dispatch(ACTIONS.FORM.DELETE, form, this.namespace)
      )
    );
  }

}


