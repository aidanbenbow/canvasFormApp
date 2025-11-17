import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';
import { UIText } from './text.js';
import { UIScrollContainer } from './scrollContainer.js';
import { UIFormCard } from './formCard.js';
import { createUIComponent } from './createUIComponent.js';

export class Dashboard extends UIElement {
  constructor({ id = 'dashboard', context,layoutManager,layoutRenderer, forms, onCreateForm, onEditForm, onViewResults }) {

    super({ id, context, layoutManager, layoutRenderer });
    let parsedForms = typeof forms === 'string' ? JSON.parse(forms) : forms;
// this.forms = Array.isArray(parsedForms)
//   ? parsedForms.filter(f => f.label && Array.isArray(f.formStructure))
//   : [];
this.forms = [
  {
    "id": "form-1763362397631",
    "formStructure": {
     "fields": [
      {
       "id": "input-1763362399454",
       "label": "New student",
       "layout": {
        "height": 70,
        "parent": null,
        "width": 570,
        "x": 215,
        "y": 95
       },
       "type": "text"
      },
      {
       "id": "input-1763362400477",
       "label": "Name",
       "layout": {
        "height": 70,
        "width": 570,
        "x": 215,
        "y": 180
       },
       "placeholder": "Enter text here...",
       "type": "input"
      },
      {
       "id": "button-1763362401308",
       "label": "submit",
       "type": "button"
      }
     ],
     "layout": {
      "button-1763362401308": {
       "height": 70,
       "width": 570,
       "x": 215,
       "y": 265
      },
      "input-1763362399454": {
       "height": 70,
       "parent": null,
       "width": 570,
       "x": 215,
       "y": 95
      },
      "input-1763362400477": {
       "height": 70,
       "width": 570,
       "x": 215,
       "y": 180
      }
     }
    },
    "label": "new form",
    "lastModified": "2025-11-17T06:53:40.272Z",
    "user": "admin"
   }

]
this.selectedForm = null;
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

  buildUI() {
    const UIcontainer = createUIComponent({
      id: `dashboard-container`,
      type: 'container',
      layout: { x: 10, y: 20, width: 200, height: 300 }
    }, this.context);
    UIcontainer.initializeScroll();
    this.addChild(UIcontainer);
    const viewBtn = createUIComponent({
      id: `dashboard-viewBtn`,
      type: 'button',
      label: 'View',
      
      onClick: () => {
        if (this.selectedForm) {
          this.onCreateForm(this.selectedForm);
        } else {
          console.log('No form selected to view results.');
        }
      }
    }, this.context, {place: false});
    UIcontainer.addChild(viewBtn);

    this.formsContainer = createUIComponent({
      id: `${this.id}-formsContainer`,
      type: 'container',
      layout: { x: 300, y: 20, width: 280, height: 500 },
      
    }, this.context);
    this.formsContainer.initializeScroll();
    this.addChild(this.formsContainer);
  }
  

  buildLayout() {
    const title = createUIComponent({
      id: `${this.id}-title`,
      type: 'text',
      label: `welcome ${this.forms[0]?.user || 'user'}`,
     
    }, this.context);
    this.formsContainer.addChild(title);
    const form1 = createUIComponent({
      id: `formCard-0`,
      type: 'text',
      label: this.forms[0]?.label || 'Form 1',
      onClick: () => {
        this.selectedForm = this.forms[0];
      },
    }, this.context);
    this.formsContainer.addChild(form1);
  }

  registerHitRegions(hitRegistry) {
    hitRegistry.registerPluginHits(this, {
      createFormButton: 'button',
    });

    // // Register hits for dynamic form cards
    // this.forms.forEach((form, index) => {
    //   hitRegistry.registerPluginHits(this, {
    //     [`edit-${index}`]: 'button',
    //     [`view-${index}`]: 'button',
    //   });
    // });

      //register granchildren hits
    const formList = this.getChildById('formList');
    formList.children.forEach(formCard => {
      formCard.registerHitRegions?.(hitRegistry);
    });
    

    }
  

  // render() {
  //  // console.log('Rendering Dashboard');
  //   // Optional dashboard background
  //   this.layoutRenderer.drawRect(this.id, { fill: '#fff', stroke: '#ccc', lineWidth: 1 });

  //   // Render children
  //   this.children.forEach(child => {
  //     const ctx = this.layoutRenderer.ctx;
     
  //     if (child.scrollController) {
  //       ctx.save();
  //       const bounds = this.layoutManager.getScaledBounds(child.id, ctx.canvas.width, ctx.canvas.height);
      
  //       ctx.beginPath();
  //       ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
  //      // ctx.clip();
  //       child.scrollController.apply(ctx);
  //       child.children.forEach(grandchild => {
  //           grandchild.render()});
  //       ctx.restore();
  //     } else {
  //       child.render();
  //     }
  //   });
  // }

  // Handle mouse wheel scrolling
  handleScroll(deltaY) {
    const formList = this.getChildById('formList');
    if (formList?.scrollController) {
      formList.scrollController.scrollBy(deltaY);
    }
  }
}