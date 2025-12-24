
import { BaseScreen } from './baseScreen.js';
import { ACTIONS } from '../events/actions.js';
import { createUIComponent } from './createUIComponent.js';

import { bindList } from '../state/reactiveStore.js';
import { layoutRegistry } from '../registries/layoutRegistry.js';
import { SceneNode } from './nodes/sceneNode.js';
import { legacyWidgetRenderer } from '../strategies/layoutEngine.js';
import { containerRenderer } from '../renderers/containerRenderer.js';


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

  createRoot() {
    const layoutFactory = layoutRegistry[dashboardUIManifest.layout];

    const root = new SceneNode({
      id: 'dashboard-root',
      layoutStrategy: layoutFactory,
      renderStrategy: containerRenderer,
      children: []
    });

    this.regions = {};

    Object.entries(dashboardUIManifest.regions).forEach(([key, def]) => {
      // Legacy widget
      const widget = createUIComponent(
        { id: `dashboard-${key}`, type: def.type },
        this.context
      );

      const regionNode = new SceneNode({
        id: `dashboard-${key}`,
        layoutStrategy: layoutFactory,
        renderStrategy: containerRenderer,
        children: []
      });

      regionNode.widget = widget;
      root.add(regionNode);
      this.regions[key] = regionNode;

      // Static toolbar buttons
      if (def.children) {
        const buttons = this.factories.commandUI.createButtons(
          def.children,
          this.commandRegistry
        );

        widget.setChildren(buttons);

        buttons.forEach(btnWidget => {
          const btnNode = new SceneNode({
            id: btnWidget.id,
            layoutStrategy: layoutRegistry.vertical,
            renderStrategy: legacyWidgetRenderer
          });

          btnNode.widget = btnWidget;
          regionNode.add(btnNode);
        });
      }
    });

    return root;
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


