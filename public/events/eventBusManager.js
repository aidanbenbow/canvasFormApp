export class EventBusManager {
    constructor(eventBus){
        this.eventBus = eventBus;
        this.registry = new Map();
    }
    on(event, handler,namespace='global') {
        this.eventBus.on(event, handler);
        if (!this.registry.has(namespace)) {
            this.registry.set(namespace, []);
        }
        this.registry.get(namespace).push({ event, handler });
    }
    emit(event, payload) {
        console.log(`Emitting event: ${event} with payload:`, payload);
        this.eventBus.emit(event, payload);
    }
   clearNamespace(namespace) {
        const handlers = this.registry.get(namespace);
        if(!handlers){
            console.warn(`No handlers found for namespace: ${namespace}`);
            return;
        }
        for(const { event, handler } of handlers){
            this.eventBus.off(event, handler);
        }
        this.registry.delete(namespace);
    }
}