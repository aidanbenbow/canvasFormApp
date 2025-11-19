import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';
import { UIText } from './text.js';
import { UIScrollContainer } from './scrollContainer.js';
import { UIFormCard } from './formCard.js';
import { createUIComponent } from './createUIComponent.js';

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
      action: (dashboard) => {
        dashboard.onEditForm(dashboard.selectedForm || null);
      }
    }
  ]
};

export class Dashboard extends UIElement {
  constructor({ id = 'dashboard', context,layoutManager,layoutRenderer, forms, onCreateForm, onEditForm, onViewResults }) {

    super({ id, context, layoutManager, layoutRenderer });
this.forms = forms || [];
  console.log('Dashboard initialized with forms:', this.forms);

this.selectedForm = null;
this.selectedFormCard = null;
this.context = context;
this.layoutManager = layoutManager;
this.layoutRenderer = layoutRenderer;
    this.onCreateForm = onCreateForm;
    this.onEditForm = onEditForm;
    this.onViewResults = onViewResults;
this.formsContainer = null;
this.buildUI();
this.buildLayout();

  }
  buildUIFromManifest(manifest) {
    manifest.containers.forEach(({ idSuffix, type, layout, scroll, assignTo }) => {
      const component = createUIComponent({
        id: `${this.id}-${idSuffix}`,
        type,
        layout
      }, this.context);
      if (scroll) component.initializeScroll();
      this.addChild(component);
      if (assignTo) this[assignTo] = component;
    });
  
    manifest.buttons.forEach(({ idSuffix, label, action }) => {
      const button = createUIComponent({
        id: `${this.id}-${idSuffix}`,
        type: 'button',
        label,
        onClick: () => action(this)
      }, this.context, { place: false });
      this.uiContainer.addChild(button);
    });
  }

  buildUI() {
    this.buildUIFromManifest(dashboardUIManifest);
    // const UIcontainer = createUIComponent({
    //   id: `dashboard-container`,
    //   type: 'container',
    //   layout: { x: 10, y: 20, width: 200, height: 300 }
    // }, this.context);
    // UIcontainer.initializeScroll();
    // this.addChild(UIcontainer);

    // const viewBtn = createUIComponent({
    //   id: `dashboard-viewBtn`,
    //   type: 'button',
    //   label: 'View',
      
    //   onClick: () => {
    //     if (this.selectedForm) {
    //       this.onCreateForm(this.selectedForm);
    //     } else {
    //       console.log('No form selected to view results.');
    //     }
    //   }
    // }, this.context, {place: false});
    // UIcontainer.addChild(viewBtn);

    // const resultsBtn = createUIComponent({
    //   id: `dashboard-resultsBtn`,
    //   type: 'button',
    //   label: 'Results',
      
    //   onClick: () => {
    //     if (this.selectedForm) {
    //       this.onViewResults(this.selectedForm);
    //     } else {
    //       console.log('No form selected to view results.');
    //     }
    //   }
    // }, this.context, {place: false});
    // UIcontainer.addChild(resultsBtn);

    // const createEditBtn = createUIComponent({
    //   id: `dashboard-createEditBtn`,
    //   type: 'button',
    //   label: 'Create/Edit',
      
    //   onClick: () => {
    //     if (this.selectedForm) {
    //       this.onEditForm(this.selectedForm);
    //     } else {
    //      this.onEditForm(null);
    //     }
    //   }
    // }, this.context, {place: false});
    // UIcontainer.addChild(createEditBtn);

    // this.formsContainer = createUIComponent({
    //   id: `${this.id}-formsContainer`,
    //   type: 'container',
    //   layout: { x: 300, y: 20, width: 280, height: 500 },
      
    // }, this.context);
    // this.formsContainer.initializeScroll();
    // this.addChild(this.formsContainer);
  }
  

  buildLayout() {
    const title = createUIComponent({
      id: `${this.id}-title`,
      type: 'text',
      label: `welcome ${this.forms[0]?.user || 'user'}`,
     
    }, this.context);
    this.formsContainer.addChild(title);

this.forms.forEach((form, index) => {
  const formCard = createUIComponent({
    id: `formCard-${index}`,
    type: 'text',
    label: form.label || `Form ${index + 1}`,
    onClick: () => {
      // Reset previous selection
      if (this.selectedFormCard) {
        this.selectedFormCard.setStyle({ bgColor: null });
      }

      // Set new selection
      this.selectedForm = form;
      this.selectedFormCard = formCard;
      formCard.setStyle({ bgColor: '#d0f0fd' });
this.context.pipeline.invalidate();
      console.log('Selected form:', form.label);
    }

  }, this.context);
  this.formsContainer.addChild(formCard);

  } );

  }
}