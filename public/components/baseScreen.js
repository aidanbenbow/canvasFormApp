
export class BaseScreen {
    constructor({ id, context, dispatcher, eventBusManager }) {
      this.id = id;
      this.context = context;
      this.dispatcher = dispatcher;
      this.eventBusManager = eventBusManager;
  
      this.rootNode = null
    }
  
    createRoot() {
      throw new Error('createRoot() must be implemented');
    }
  
    onEnter() {}
    onExit() {}
  
    attach(pipeline) {
      pipeline.setRoot(this.rootNode);
      this.onEnter();
    }
  
    detach() {
      this.onExit();
    }
  }
  