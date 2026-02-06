export class EventBusManager {
    constructor(eventBus){
        this.eventBus = eventBus;
        this.registry = new Map();
    }
    _ensureNamespace(namespace) {
        if (!this.registry.has(namespace)) {
            this.registry.set(namespace, []);
        }
    }
    on(event, handler,namespace='global') {
        this._ensureNamespace(namespace);
        const entries = this.registry.get(namespace);
        if(entries.some(e => e.event === event && e.handler === handler)){
            console.warn(`Handler already registered for event: ${event} in namespace: ${namespace}`);
            return;
        }
        entries.push({ event, handler });
        this.eventBus.on(event, handler);
    }
    off(event, handler, namespace = "global") {
        const entries = this.registry.get(namespace);
        if (!entries) return;
      
        // remove from the real event bus
        this.eventBus.off(event, handler);
      
        // remove from registry
        const next = entries.filter(e => !(e.event === event && e.handler === handler));
      
        if (next.length === 0) this.registry.delete(namespace);
        else this.registry.set(namespace, next);
      }
      
    emit(event, payload, namespace='global') {
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
    clearAll() {
        for(const namespace of this.registry.keys()){
            this.clearNamespace(namespace);
        }
    }
}