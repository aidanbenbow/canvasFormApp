

export class HitRouter {
    constructor(hitRegistry, modeState, textEditorController, actionRegistry,
      layoutManager, canvaswidth, canvasheight) {
      this.hitRegistry = hitRegistry;
      this.actionRegistry = actionRegistry;
      
      this.modeState = modeState;
      this.textEditorController = textEditorController;
      this.handlers = new Map(); // type -> handler
      this.layoutManager = layoutManager;
      this.canvasWidth = canvaswidth;
      this.canvasHeight = canvasheight;
    }
  
    registerHandler(type, handlerFn) {
      this.handlers.set(type, handlerFn);
    }
    routePointer(x, y) {
      
      for (const [hex, hitInfo] of this.hitRegistry.entries()) {
        
        const bounds = this.layoutManager.getScaledBounds(hex, this.canvasWidth, this.canvasHeight);
        
        if (!bounds) continue;
    
        const within =
          x >= bounds.x &&
          x <= bounds.x + bounds.width &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height;
    
        if (within) {
          this.routeHit(hex, x, y);
          return;
        }
      }
    }
    
  
    routeHit(hex,x,y) {
      const hitInfo = this.hitRegistry.get(hex);
     
      if (!hitInfo) return;
  
      const { type, box, region, metadata, plugin } = hitInfo;
  
      if (this.modeState.current === 'fill'){

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
      } // ✅ NEW: plugin fallback in fill mode
      if (plugin?.handleClick) {
        plugin.handleClick(x,y);
      }
      return;
    }
  
       // Admin mode: editable regions
  if (this.modeState.current === 'admin') {
    if (region === 'main' || region === 'label') {
      const editableField = region === 'label' ? 'label' : 'text';

      this.textEditorController.startEditing(box, editableField);
      return;
    }
    // ✅ NEW: fallback to plugin click handler
  const plugin = hitInfo.plugin;
  if (plugin?.handleClick) {
    plugin.handleClick(x,y);
  }
  return;

  }
    }
  }