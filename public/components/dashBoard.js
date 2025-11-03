import { UIElement } from './UiElement.js';
import { UIButton } from './button.js';
import { UIText } from './text.js';
import { UIScrollContainer } from './scrollContainer.js';
import { UIFormCard } from './formCard.js';

export class Dashboard extends UIElement {
  constructor({ id = 'dashboard', layoutManager, layoutRenderer,forms, onCreateForm, onEditForm, onViewResults }) {
    super({ id, layoutManager, layoutRenderer });
    let parsedForms = typeof forms === 'string' ? JSON.parse(forms) : forms;
this.forms = Array.isArray(parsedForms)
  ? parsedForms.filter(f => f.label && Array.isArray(f.formStructure))
  : [];

    this.onCreateForm = onCreateForm;
    this.onEditForm = onEditForm;
    this.onViewResults = onViewResults;

    this.buildLayout();
    this.buildUI();
  }

  buildLayout() {
    // Title
    this.layoutManager.place({ id: 'dashboardTitle', x: 10, y: 20, width: 100, height: 50 });
    // Create Form Button
    this.layoutManager.place({ id: 'createFormButton', x: 10, y: 80, width: 100, height: 50 });
    // Scrollable form list container
    this.layoutManager.place({ id: 'formList', x: 10, y: 150, width: 300, height: 400 });
    
  }
  

  buildUI() {
    // Dashboard title
    const title = new UIText({
      id: 'dashboardTitle',
      text: 'Welcome, Admin!',
      fontSize: 0.02,
      color: '#333',
      align: 'left',
      valign: 'top',
      
    });
    this.addChild(title);

    // Create form button
    const createButton = new UIButton({
      id: 'createFormButton',
      label: 'Create New Form',
      onClick: this.onCreateForm
    });
    this.addChild(createButton);

    // Scrollable container
    const scrollContainer = new UIScrollContainer({
        id: 'formList',
        layoutManager: this.layoutManager,
        layoutRenderer: this.layoutRenderer
      });
      scrollContainer.initializeScroll(); // ✅ after layoutManager.place()

    // Dynamic card height & spacing
    const containerBounds = this.layoutManager.getLogicalBounds('formList');
    const containerHeight = containerBounds.height;
    const formCount = this.forms.length;
    let spacing = containerHeight * 0.02;
    const maxCardHeight = containerHeight * 0.15;
    let cardHeight = containerHeight / formCount - spacing
  
    
    if (cardHeight > maxCardHeight) {
      cardHeight = maxCardHeight;
      spacing = (containerHeight - cardHeight * formCount) / (formCount - 1);
    }
   
      
    // Create form cards
    this.forms.forEach((form, index) => {
      const cardId = `formCard-${index}`;
      const y = containerBounds.y + index * (cardHeight + spacing);
    
      this.layoutManager.place({
        id: cardId,
        x: containerBounds.x,
        y,
        width: containerBounds.width,
        height: cardHeight
      });
    
      const formCard = new UIFormCard({
        id: cardId,
        form,
        layoutManager: this.layoutManager,
        layoutRenderer: this.layoutRenderer,
        onEdit: this.onEditForm,
        onView: this.onViewResults
      });
    
      scrollContainer.addChild(formCard);
    });
    scrollContainer.updateContentHeight(); // ✅ update after adding children
   this.addChild(scrollContainer);
    console.log(this.children);
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
  

  render() {
   // console.log('Rendering Dashboard');
    // Optional dashboard background
    this.layoutRenderer.drawRect(this.id, { fill: '#fff', stroke: '#ccc', lineWidth: 1 });

    // Render children
    this.children.forEach(child => {
      const ctx = this.layoutRenderer.ctx;
     
      if (child.scrollController) {
        ctx.save();
        const bounds = this.layoutManager.getScaledBounds(child.id, ctx.canvas.width, ctx.canvas.height);
      
        ctx.beginPath();
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
       // ctx.clip();
        child.scrollController.apply(ctx);
        child.children.forEach(grandchild => {
            grandchild.render()});
        ctx.restore();
      } else {
        child.render();
      }
    });
  }

  // Handle mouse wheel scrolling
  handleScroll(deltaY) {
    const formList = this.getChildById('formList');
    if (formList?.scrollController) {
      formList.scrollController.scrollBy(deltaY);
    }
  }
}