import { ActionDispatcher } from "../events/actionDispatcher.js";
import { EventBus } from "../events/eventBus.js";
import { EventBusManager } from "../events/eventBusManager.js";
import { RendererRegistry } from "../registries/renderRegistry.js";


export class CanvasSystemBuilder {
    constructor(canvasManager){
        this.canvasManager = canvasManager;
        this.components = {};
    }
    createEventBus(){
        const bus = new EventBus();
        const manager = new EventBusManager(bus);
        this.components.eventBus = bus
        this.components.eventBusManager = manager;
        this.components.actionDispatcher = new ActionDispatcher(manager);
        return this;
    }
    createRendererRegistry(){
        this.components.rendererRegistry = new RendererRegistry();
        return this;
    }
    build(){
        return this.components;
    }
}