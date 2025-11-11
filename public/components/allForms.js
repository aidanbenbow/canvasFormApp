import { UIElement } from "./UiElement.js";
import { UIButton } from "./button.js";
import { UIScrollContainer } from "./scrollContainer.js";
import { UIText } from "./text.js";


export class AllForms extends UIElement{
constructor({ id = 'allForms', layoutManager, layoutRenderer, user,forms, onCreateForm, onViewForm }) {
    super({ id, layoutManager, layoutRenderer });
    this.user = user;
    this.forms = forms; // Array of form objects to display
    this.onCreateForm = onCreateForm
    this.onViewForm = onViewForm
    this.buildLayout();
    this.buildUI();
  }
  buildLayout(){
    this.layoutManager.place({
        id: `${this.id}-title`,
        x: 20, y: 20, width: 70, height: 60,
        parent: this.id
        });
        this.layoutManager.place({ id: 'createFormButton', x: 10, y: 80, width: 100, height: 50 });
        this.layoutManager.place({ id: 'formList', x: 10, y: 150, width: 300, height: 400, parent: this.id });
  }
    buildUI(){
        const title = new UIText({
            id: `${this.id}-title`,
            text: `forms for: ${this.user || 'Untitled Form'}`,
            fontSize: 0.05,
            color: '#000',
            align: 'left',
            valign: 'middle'
            });

        this.addChild(title);
        // Create form button
    const createButton = new UIButton({
        id: 'createFormButton',
        label: 'Create New Form',
        onClick: this.onCreateForm
      });
      this.addChild(createButton);

        const scrollContainer = new UIScrollContainer({
            id: 'formList',
            layoutManager: this.layoutManager,
            layoutRenderer: this.layoutRenderer
          });
          scrollContainer.initializeScroll();

        

          this.forms.forEach((form, index) => {
            console.log(form);
            const formText = new UIText({
              id: `form-${index}`,
              text: `Form ${index + 1}: ${form.id || 'Untitled Form'}`,
              fontSize: 0.03,
              color: '#333',
              align: 'left',
              valign: 'middle'
            });
            this.layoutManager.place({
                id: `form-${index}`,
                x: 20,
                y: index * 40,
                width: 160,
                height: 30,
                parent: 'formList'
                });

               const viewButton = new UIButton({
                id: `view-button-${index}`,
                label: 'View',
                onClick: () => {
                  this.onViewForm(form)
                } 
                });
                this.layoutManager.place({
                    id: `view-button-${index}`,
                    x: 200,
                    y: index * 40,
                    width: 80,
                    height: 30,
                    parent: 'formList'
                    }); 

            scrollContainer.addChild(formText);
            scrollContainer.addChild(viewButton);
          });
          scrollContainer.updateContentHeight();
            this.addChild(scrollContainer);
    }
}