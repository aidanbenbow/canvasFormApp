import { UIElement } from "./UiElement.js";

export class BaseScreen {
    constructor({ id=null,  context, dispatcher, eventBusManager, namespace=null }) {
        this.id = id||`BaseScreen_${Math.random().toString(36).substr(2, 9)}`;
        this.context = context;
        this.dispatcher = dispatcher;
        this.eventBusManager = eventBusManager;
        this.namespace = namespace || `BaseScreen_${id || Math.random().toString(36).substr(2, 9)}`;

        this.rootElement = new UIElement({
            id: `${this.id}-root`,
            context: this.context,
            layoutManager: this.context?.uiStage.layoutManager,
            layoutRenderer: this.context?.uiStage.layoutRenderer,
        });
    }
    listenAction(actionType, handler) {
        this.dispatcher.on(actionType, handler.bind(this), this.namespace);
    }
    listenEvent(eventType, handler) {
        this.eventBusManager.on(eventType, handler.bind(this), this.namespace);
    }
    onEnter() {
        // To be overridden by subclasses
    }
    onExit() {
        // To be overridden by subclasses
        this.dispatcher.clear(this.namespace);
        this.eventBusManager.clearNamespace(this.namespace);
    }
    attachToStage(stage) {
        stage.addRoot(this.rootElement);
        stage.setActiveRoot(this.rootElement.id);
        if(typeof this.onEnter === 'function'){
            this.onEnter();
        }
    }
    detachFromStage(stage) {
        stage.removeRoot(this.rootElement.id);
        if(typeof this.onExit === 'function'){
            this.onExit();
        }
    }
    layout(width, height) {
        console.log(`Laying out screen ${this.id} with dimensions:`, width, height);
       this.rootElement.layout(0, 0, width, height);
       this.rootElement.measureAndLayout({ maxWidth: width, maxHeight: height });
    }
}