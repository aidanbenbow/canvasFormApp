import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';
import { UIText } from './text.js';
import { UIScrollContainer } from './scrollContainer.js';
import { UIFormCard } from './formCard.js';
import { createUIComponent } from './createUIComponent.js';
import { ManifestUI } from './manifestUI.js';

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

export class Dashboard extends ManifestUI{
  constructor({ id = 'dashboard', context,layoutManager,layoutRenderer, store, ...handlers }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.store = store;
    this.onCreateForm = handlers.onCreateForm;
    this.onEditForm = handlers.onEditForm;
    this.onViewResults = handlers.onViewResults;
  
    // Subscribe to store updates
    // this.context.eventBus.on('forms:updated', (forms) => {
    //   this.forms = forms;
    //   this.buildLayout(); // rebuild UI when forms change
    //   this.context.pipeline.invalidate();
    // });
    
    this.buildUI();
    this.buildLayout();
  }
  buildUI() {
    this.buildContainersFromManifest(dashboardUIManifest.containers);
    this.buildChildrenFromManifest(dashboardUIManifest.buttons, this.uiContainer)
  }
  buildLayout() {
    this.displayFormsLabels(this.store.getForms(), this.formsContainer, { onSelect: null });
  }
}
