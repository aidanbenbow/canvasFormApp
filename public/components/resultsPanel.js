import { UIElement } from "./UiElement.js";
import { UIText } from "./text.js";


export class ResultsPanel extends UIElement{
constructor({ id = 'resultsPanel', results = [], layoutManager, layoutRenderer }) {
    super({ id, layoutManager, layoutRenderer });
    this.type = 'resultsPanel';
    this.results = results; // Array of result objects to display
    this.visible = true;
    this.draggable = true;
    this.fields = this.results[0].inputs.fields || [];
    this.buildLayout();
    this.buildUI();
  }
buildLayout(){
// Build UI components for results display
this.layoutManager.place({
    id: `${this.id}-title`,
    x: 20, y: 20, width: 70, height: 60,
    parent: this.id
    });

    this.layoutManager.place({
    id: `${this.id}-results`,
    x: 20, y: 90, width: 75, height: 70,
    parent: this.id
    });
}
buildUI(){
    // Title Text
    const title = new UIText({
    id: `${this.id}-title`,
    text: `${this.results[0].formId}`,
    fontSize: 0.05,
    color: '#000',
    align: 'left',
    valign: 'middle'
    });

    this.addChild(title);

    // Results Text
    this.fields.forEach((field, index) => {
        this.layoutManager.place({
        id: `${this.id}-result-${field.id}`,
        x: 20,
        y: 100 + index * 30,
        width: 70,
        height: 25,
        parent: this.id
        });
        const resultText = new UIText({
        id: `${this.id}-result-${field.id}`,
        text: `${field.id}:${field.value}`,
        fontSize: 0.03,
        color: '#333',
        align: 'left',
        valign: 'middle'
        });
        this.addChild(resultText);

} );
}

}