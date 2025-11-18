import { UIElement } from "./UiElement.js";
import { UIButton } from "./button.js";
import { createUIComponent } from "./createUIComponent.js";
import { UIText } from "./text.js";


export class UIFormResults extends UIElement {
    constructor({ id='formResults', form, results,context, layoutManager, layoutRenderer, onClose }) {
        super({ id,context, layoutManager, layoutRenderer });
        this.form = form;
        this.results = results;
        this.onClose = onClose;
    console.log('Form Results:', results);
    this.resultsContainer = null;
        this.buildLayout();
        this.buildUI();
    }
    
    buildLayout() {
      this.resultsContainer = createUIComponent({
        id: `${this.id}-container`,
        type: 'container',
        layout: { x: 10, y: 10, width: 600, height: 400 }
       }, this.context);
         this.resultsContainer.initializeScroll();
         this.addChild(this.resultsContainer);
    }
    
    buildUI() {
        const title = createUIComponent({
            id: `${this.id}-title`,
            type: 'text',
            label: `Results for: ${this.form.label || 'Untitled Form'}`
        }, this.context);
        this.resultsContainer.addChild(title);
    
    this.results.forEach((result, index) => {
        const resultText = createUIComponent({
            id: `${this.id}-result-${index}`,
            type: 'text',
            label: ` ${JSON.stringify(result.inputs)}`
        }, this.context);
        this.resultsContainer.addChild(resultText);

    } )
    
}
}

