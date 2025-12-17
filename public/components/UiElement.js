

export class UIElement {
    static focusedElement = null;
    constructor({ id, context=null,}) {
      this.id = id;
      
  this.context = context;
      this.layoutManager = context?.uiStage?.layoutManager||null;
      this.layoutRenderer = context?.uiStage?.layoutRenderer||null;
      this.children = [];
      this.parent = null;
      this.visible = true;
      this.interactive = false;

      // 🔹 Interaction state flags
      this.isHovered = false;
      this.isActive = false;
      this.isFocused = false;
      this.isDragging = false;

      this.bounds = { x: 0, y: 0, width: 0, height: 0 };
      this._measured = { width: 0, height: 0 };
    }
  
    addChild(child) {
      child.parent = this;
      this.children.push(child);
    
    }

    static setFocus(target) {
      // Only blur if the current focused element is different and is focusable
      if (UIElement.focusedElement && UIElement.focusedElement !== target && UIElement.focusedElement.focusable) {
        UIElement.focusedElement.onBlur();
      }
    
      // Only assign focus if the target itself is focusable
      if (target.focusable) {
        UIElement.focusedElement = target;
        target.onFocus();
      }
    }
      
  
    getScaledBounds(canvasWidth, canvasHeight) {
      const cw = canvasWidth || this.layoutRenderer?.canvas?.width;
      const ch = canvasHeight || this.layoutRenderer?.canvas?.height;
      return this.layoutManager.scaleRect(
        this.bounds,
        cw,
        ch
      );
    }

    getGlobalPosition() {
      let x = this.bounds.x || 0;
      let y = this.bounds.y || 0;
      let ancestor = this.parent;
      while (ancestor) {
        x += ancestor.bounds.x || 0;
        y += ancestor.bounds.y || 0;
        if(ancestor.scrollController){
            x -= ancestor.scrollController.offsetX;
            y -= ancestor.scrollController.offsetY;
        }
        ancestor = ancestor.parent;
      }
      return { x, y, width: this.bounds.width, height: this.bounds.height };
    }

    hitTestPoint(x, y) {
      const b = this.getGlobalPosition();
      return x >= b.x && x <= b.x + b.width &&
              y >= b.y && y <= b.y + b.height;
    }
  
    contains(x, y) {
      const b = this.getScaledBounds();
      if (!b) return false;

let scrollOffsetY = 0;
let ancestor = this.parent;
while (ancestor) {
    if (ancestor.scrollController) {
        scrollOffsetY += ancestor.scrollController.offsetY;
    }
    ancestor = ancestor.parent;
}
  const adjustedY = y + scrollOffsetY;

      return x >= b.x && x <= b.x + b.width &&
              adjustedY >= b.y && adjustedY <= b.y + b.height;
    }
  
    // 🔹 Extended event dispatch
    dispatchEvent(event) {
      if (!this.visible) return false;
 
      for (const child of this.children) {
     
        const hit = child.contains(event.x, event.y);
     
        // If child is a container, recurse regardless
        if (child.children.length > 0||child.interactive) {
          if (child.dispatchEvent(event)) return true;
        }
      
        if (event.type === 'mousemove' && child.isHovered && !hit) {
          child.onMouseLeave();
        }
      }
  
      // TARGET phase
       const hit = this.contains(event.x, event.y);
      this.lastEventX = event.x;
      this.lastEventY = event.y;

      if (this.interactive) {
        if (event.type === 'mousemove') {
          if (hit && !this.isHovered) this.onMouseEnter();
          if (!hit && this.isHovered) this.onMouseLeave();
        }
  
        if (hit && event.type === 'mousedown') this.onMouseDown();
        if (hit && event.type === 'mouseup') this.onMouseUp();
  
        if (hit && event.type === 'click') {
          console.log(`UIElement ${this.id} received click event.`);
          this.onClick();
          return true;
        }
      }
  
      // BUBBLE phase
      if (this.parent) {
        return this.parent.onChildEvent(event, this);
      }
  
      return false;
    }
  
    // 🔹 Event hooks (can be overridden)
    onMouseEnter() { this.isHovered = true;
      
      this.context.pipeline.invalidate();
}
    onMouseLeave() { this.isHovered = false; this.isActive = false;
      this.context.pipeline.invalidate();}
    onMouseDown() { this.isActive = true; 
      
    if(this.draggable&&this.layoutRenderer&&this.layoutManager){
        const bounds = this.getScaledBounds();
        const canvas = this.layoutRenderer.canvas;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const startX = this.lastEventX;
        const startY = this.lastEventY;
        this.context.dragController.startDrag(this, startX, startY);
        this.isDragging = true;
    }
    }
    onMouseUp() { this.isActive = false;
    this.context.dragController.endDrag();
    this.isDragging = false;
    }
    onMouseMove(x, y) {
      this.context.dragController.updateDrag(x, y);
    }
    onClick() {
   return false
      
    }
    onFocus() { this.isFocused = true; 
    this.context.pipeline.invalidate();}
    onBlur() { this.isFocused = false;
    this.context.pipeline.invalidate();}
  
    onChildEvent(event, child) {
     
      return false;
    }
    
  
    render() {
     // if (!this.visible) return;  
     this.renderChildren(); 
    }

    renderChildren() {
      for (const c of this.children){
        if(c.visible)
        c.render();
      } 
        
    }
    renderDragHighlight(ctx) {
      if (this.isDragging||this.isSelected) {
        const bounds = this.getScaledBounds();
        const ctx = this.layoutRenderer.ctx;
        if (bounds) {
          ctx.save();
          ctx.strokeStyle = '#00aaff';
          ctx.lineWidth = 2;
          ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
          ctx.restore();
        }
      }
    }

    getChildById(id) {
        return this.children.find(c => c.id === id);
      }

      clearChildren() {
        for (const child of this.children) child.parent = null;
        this.children = [];
      }
      removeChild(child) {
        this.children = this.children.filter(c => c !== child);
        child.parent = null;
      }
// In UIElement
measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
  let totalWidth = 0;
  let totalHeight = 0;

  for (const child of this.children) {
  
    const childSize = child.measure(constraints);
    totalWidth = Math.max(totalWidth, childSize.width);
    totalHeight += childSize.height;
    if (!Number.isFinite(childSize.width) || !Number.isFinite(childSize.height)) {
      console.warn(`Child ${child.id} returned invalid size`, childSize);
    }
  }

  // fallback if no children
  if (this.children.length === 0) {
    totalWidth = Math.min(constraints.maxWidth, this.bounds.width || constraints.maxWidth);
    totalHeight = Math.min(constraints.maxHeight, this.bounds.height || 30);
  }

  this._measured = { width: totalWidth, height: totalHeight };

  return this._measured;
}

layout(x, y, width, height) {
  this.bounds = { x, y, width, height };

  let currentY = y;
  for (const child of this.children) {
    const childSize = child._measured || child.measure({ maxWidth: width, maxHeight: height });
    child.layout(x, currentY, childSize.width, childSize.height);
    currentY += childSize.height;
  }
}
      
  }