import { EventBus } from "../events/eventBus.js";
import { RendererRegistry } from "../registries/renderRegistry.js";


export class CanvasSystemBuilder {
    constructor(canvasManager){
        this.canvasManager = canvasManager;
        this.components = {};
    }
    createEventBus(){
        this.components.eventBus = new EventBus();
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