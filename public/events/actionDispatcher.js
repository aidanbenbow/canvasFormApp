export class ActionDispatcher {
    constructor(eventBusManager) {
      this.bus = eventBusManager;
    }
    dispatch(actionType, payload, namespace='global') {
      this.bus.emit(actionType, payload, namespace);
    }

    on(actionType, handler, namespace='global') {
        this.bus.on(actionType, handler, namespace);
    }

    clear(namespace) {
        this.bus.clearNamespace(namespace);
    }
  
  }