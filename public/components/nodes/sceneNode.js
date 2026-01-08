import { TinyEmitter } from "../../events/tinyEmitter.js";

export class SceneNode {
    constructor({
      id,
      style = {},
      visible = true,
      layoutStrategy = null,
      renderStrategy = null,
      updateStrategy = null,
      hitTestStrategy = null,
      children = []
    }) {
      this.id = id;
      this.style = style;
      this.visible = visible;

      this.emitter = new TinyEmitter();
  
      this.layoutStrategy = layoutStrategy;
      this.renderStrategy = renderStrategy;
      this.updateStrategy = updateStrategy;
      this.hitTestStrategy = hitTestStrategy;
  
      this.children = [];
      this.parent = null;
  
      this.measured = null;
      this.bounds = null;
      this.hitTestable = true;
  
      for (const child of children) this.add(child);
    }
  
    add(child) {
      child.parent = this;
      this.children.push(child);
    }
  
    // --- Lifecycle Pipelines ---
  
    measure(ctx, constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
    
        // Then measure self via strategy
        this.measured = this.layoutStrategy?.measure?.(this, constraints, ctx) ?? {
          width: this.style.width ?? 100,
          height: this.style.height ?? 30
        };
        return this.measured;
      }
    
  
    layout(bounds, ctx) {
      this.bounds = bounds;
      this.layoutStrategy?.layout?.(this, bounds, ctx);
      for (const child of this.children) {
        if (!child.bounds) {
          // Fallback: give child a zero-sized box at parent's origin
          child.bounds = {
            x: bounds.x,
            y: bounds.y,
            width: 0,
            height: 0
          };
        }
    
        child.layout(child.bounds, ctx);
      }
    
    }
  
    update(dt, ctx) {
      this.updateStrategy?.update?.(this, dt, ctx);
      for (const child of this.children) child.update(dt, ctx);
    }
  
    render(ctx) {
      if (!this.visible) return;
      this.renderStrategy?.render?.(this, ctx);
      for (const child of this.children) child.render(ctx);
    }
  
    hitTest(point) {
      if (!this.hitTestable) return null;
      return this.hitTestStrategy?.hitTest?.(this, point) ?? null;
    }
   
  contains(x, y) {
    const b = this.bounds;
    return x >= 0 && x <= b.width &&
           y >= 0 && y <= b.height;
  }
  setChildren(nodes) {
    this.children = [];
    nodes.forEach(n => this.add(n));
  }
  onEventCapture(event) {
    return false;
  }

  onEvent(event) {
    return false;
  }

  onEventBubble(event) {
    return false;
  }
  on(event, handler) {
    this.emitter.on(event, handler);
  }

  off(event, handler) {
    this.emitter.off(event, handler);
  }

  emit(event, payload) {
    this.emitter.emit(event, payload);
  }

  invalidate() {
    this.emit("invalidate", this);
     // Bubble invalidate up to the root
  if (this.parent) {
    this.parent.invalidate();
  }

  }

  globalToLocal(point) {
    const b = this.bounds; // absolute bounds
    return {
      x: point.x - b.x,
      y: point.y - b.y
    };
  }

  }