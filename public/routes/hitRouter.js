

export class HitRouter {
    constructor(hitRegistry, modeState, textEditorController, actionRegistry) {
      this.hitRegistry = hitRegistry;
      this.actionRegistry = actionRegistry;
      console.log('HitRouter actionRegistry:', actionRegistry);
      this.modeState = modeState;
      this.textEditorController = textEditorController;
      this.handlers = new Map(); // type -> handler
    }
  
    registerHandler(type, handlerFn) {
      this.handlers.set(type, handlerFn);
    }
  
    routeHit(hex) {
      const hitInfo = this.hitRegistry.get(hex);
      if (!hitInfo) return;
  
      const { type, box, region, metadata } = hitInfo;
  
      if (this.modeState.current === 'fill'){
if( type === 'loginButton') {
        const handler = this.handlers.get(type);
        if (handler) handler(hitInfo);
        return
      }
      if(region === 'text'||region=== 'image'){ 
        const actionKey = metadata?.actionKey;
        if (actionKey) {
          const actionFn = this.actionRegistry?.get(actionKey);
          if (typeof actionFn === 'function') {
            actionFn(box);
          } else {
            console.warn(`No action registered for key: ${actionKey}`);
          }
        }
        return
      }}
  
       // Admin mode: editable regions
  if (this.modeState.current === 'admin') {
    if (region === 'main' || region === 'label') {
      const editableField = region === 'label' ? 'label' : 'text';
      console.log('Starting text edit for', box, 'field:', editableField);
      this.textEditorController.startEditing(box, editableField);
      return;
    }

  }
    }
  }