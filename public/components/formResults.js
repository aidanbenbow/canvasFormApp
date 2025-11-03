import { UIElement } from "./UiElement.js";
import { UIButton } from "./button.js";
import { UIText } from "./text.js";


export class UIFormResults extends UIElement {
    constructor({ id='formResults', form, results, layoutManager, layoutRenderer, onClose }) {
        super({ id, layoutManager, layoutRenderer });
        this.form = form;
        this.results = results;
        this.onClose = onClose;
    console.log('Form Results:', results);
        this.buildLayout();
        this.buildUI();
    }
    
    buildLayout() {
        this.layoutManager.place({
        id: `${this.id}-title`,
        x: 20, y: 20, width: 70, height: 60,
        parent: this.id
        });
    
        this.layoutManager.place({
        id: `${this.id}-close`,
        x: 80, y: 20, width: 15, height: 15,
        parent: this.id
        });
    
        this.layoutManager.place({
        id: `${this.id}-results`,
        x: 20, y: 90, width: 75, height: 70,
        parent: this.id
        });
    }
    
    buildUI() {
        const title = new UIText({
        id: `${this.id}-title`,
        text: `Results for: ${this.form.label || 'Untitled Form'}`,
        fontSize: 0.05,
        color: '#000',
        align: 'left',
        valign: 'middle'
        });
    
        const closeButton = new UIButton({
        id: `${this.id}-close`,
        label: '✖',
        onClick: () => this.onClose?.()
        });
    
        const resultsText = new UIText({
        id: `${this.id}-results`,
        text: `Total Submissions: ${this.results.length}`,
        fontSize: 0.04,
        color: '#000',
        align: 'left',
        valign: 'top'
        });
    
        this.addChild(title);
        this.addChild(closeButton);
        this.addChild(resultsText);
    }
    }