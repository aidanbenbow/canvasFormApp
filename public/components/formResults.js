
import { BaseScreen } from "./baseScreen.js";
import { ManifestUI } from "./manifestUI.js";

const resultFormManifest = {
    containers: [
        {
            idSuffix: 'resultsContainer',
            type: 'container',
            layout: { x: 10, y: 10, width: 600, height: 400 },
            scroll: true,
            assignTo: 'resultsContainer'
        }
    ],
    header: [
        {
            idSuffix: 'title',
            type: 'text',
            label: form=>`results for: ${form.label}` || 'Form Results'
        },
        {
            idSuffix: 'closeBtn',
            label: 'Close',
            type: 'button',
            action: (screen) => {
                screen.onClose?.();
            }
        }
    ]
}

export class UIFormResults extends BaseScreen {
    constructor({ id='formResults', context,dispatcher, eventBusManager,store, results}) {
        super({ id, context,dispatcher, eventBusManager });
        this.store = store;
        this.form = this.store.getActiveForm();
        this.results = results || [];
this.manifestUI = new ManifestUI({ id: `${this.id}-manifestUI`, context, layoutManager: this.context.uiStage.layoutManager, layoutRenderer: this.context.uiStage.layoutRenderer });
this.rootElement.addChild(this.manifestUI);

        this.buildUI();
        this.buildLayout();
    }
    buildUI() {
        this.manifestUI.buildContainersFromManifest(resultFormManifest.containers);
    }
    buildLayout() {
        this.manifestUI.displayResultsTable( this.results, this.manifestUI.resultsContainer);
}
}

