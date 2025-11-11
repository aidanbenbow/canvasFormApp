

export class UIElement {
    static focusedElement = null;
    constructor({ id, layoutManager, layoutRenderer }) {
      this.id = id;
      this.layoutManager = layoutManager;
      this.layoutRenderer = layoutRenderer;
  
      this.children = [];
      this.parent = null;
      this.visible = true;
      this.interactive = true;
  
      // 🔹 Interaction state flags
      this.isHovered = false;
      this.isActive = false;
      this.isFocused = false;
      
    }
  
    addChild(child) {
        child.layoutManager = this.layoutManager;
        child.layoutRenderer = this.layoutRenderer;
      child.parent = this;
      this.children.push(child);
    }

    static setFocus(target) {
        if (UIElement.focusedElement && UIElement.focusedElement !== target) {
          UIElement.focusedElement.onBlur();
        }
        UIElement.focusedElement = target;
        target.onFocus();
      }
      
  
    getScaledBounds() {
      if (!this.layoutRenderer || !this.layoutManager) return null;
      return this.layoutManager.getScaledBounds(
        this.id,
        this.layoutRenderer.canvas.width,
        this.layoutRenderer.canvas.height
      );
    }
  
    contains(x, y) {
      const b = this.getScaledBounds();
      if (!b) return false;
      
      return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    }
  
    // 🔹 Extended event dispatch
    dispatchEvent(event) {
      if (!this.visible) return false;
    
      // CAPTURE phase — go through children
      for (const child of this.children) {
        if (child.contains(event.x, event.y)) {
          if (child.dispatchEvent(event)) return true;
        } else if (event.type === 'mousemove' && child.isHovered) {
          // Mouse left child
          child.onMouseLeave();
          
        }
      }
  
    //   // TARGET phase
       const hit = this.contains(event.x, event.y);
    //  // console.log(`[${this.id}] hit=${hit} type=${event.type}`);
    //   for (const child of this.children) {
    //     const hit = child.contains(event.x, event.y);
    //    // console.log(`[${child.id}] hit=${hit} type=${event.type}`);
    //     if (hit && child.dispatchEvent(event)) return true;
    //   }
      
      if (this.interactive) {
        if (event.type === 'mousemove') {
          if (hit && !this.isHovered) this.onMouseEnter();
          if (!hit && this.isHovered) this.onMouseLeave();
        }
  
        if (hit && event.type === 'mousedown') this.onMouseDown();
        if (hit && event.type === 'mouseup') this.onMouseUp();
  
        if (hit && event.type === 'click') {
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
}
    onMouseLeave() { this.isHovered = false; this.isActive = false; }
    onMouseDown() { this.isActive = true; }
    onMouseUp() { this.isActive = false; }
    onClick() {}
    onFocus() { this.isFocused = true; }
    onBlur() { this.isFocused = false; }
  
    onChildEvent(event, child) {
     
      return false;
    }
    
  
    render() {
      if (!this.visible) return;
      for (const c of this.children) c.render();
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
      layout(canvasWidth, canvasHeight) {
        for (const child of this.children) {
          
          child.layout(canvasWidth, canvasHeight);
        }
      }
      
      
  }