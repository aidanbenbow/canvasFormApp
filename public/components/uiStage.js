import { HitTestManager } from "../managers/hit.js";
import { UIElement } from "./UiElement.js";

export class UIStage {
    constructor({ layoutManager, layoutRenderer }) {
      this.layoutManager = layoutManager;
      this.layoutRenderer = layoutRenderer;
      this.overlayRoot = null;

      // Currently active root UI element
      this.activeRoot = null;
  
      // Optionally keep multiple roots
      this.roots = new Map();
  
      // Event listeners
      this._bindEvents();

      this.hitTest = null
    }
  
    // -------------------------------
    // Root management
    // -------------------------------
  
    addRoot(root) {
      this.roots.set(root.id, root);
    }
  
    setActiveRoot(rootId) {
      const root = this.roots.get(rootId);
      if (!root) throw new Error(`UIStage: no root with id ${rootId}`);
      this.activeRoot = root;
  this.hitTest = new HitTestManager(this.activeRoot);
    }

    removeRoot(rootId) {
      this.roots.delete(rootId);
      if (this.activeRoot && this.activeRoot.id === rootId) {
        this.activeRoot = null;
      }
    }
  
    getActiveRoot() {
      return this.activeRoot;
    }
  
    // -------------------------------
    // Event handling
    // -------------------------------
  
    _bindEvents() {
      const canvas = this.layoutRenderer.canvas;
  
      canvas.addEventListener('mousemove', e => this._handleMouseEvent(e, 'mousemove'));
      canvas.addEventListener('mousedown', e => this._handleMouseEvent(e, 'mousedown'));
      canvas.addEventListener('mouseup', e => this._handleMouseEvent(e, 'mouseup'));
      canvas.addEventListener('click', e => this._handleMouseEvent(e, 'click'));
  canvas.addEventListener('wheel', e => this._handleWheelEvent(e));

      window.addEventListener('keydown', e => {
        if (UIElement.focusedElement?.handleKeyDown) {
          UIElement.focusedElement.handleKeyDown(e);
        }
      });
    }
  
    _handleMouseEvent(e, type) {
        if (!this.activeRoot) return;
   
        const canvas = this.layoutRenderer.canvas;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
      
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;

        const hit = this.hitTest.hitTest(x, y);
        if (hit) {
          console.log(`Hit UIElement: ${hit.id}`);
        }

    const event = { type, x, y}

 // 🔹 Draw a marker when clicking
 if (type === 'click') {

  const ctx = this.layoutRenderer.ctx;
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  console.log("Click marker at:", x,y);
  console.log(this.roots)
}


//     if (this.overlayRoot && this.overlayRoot.messageText?.contains(x, y)) {
//       if (this.overlayRoot.dispatchEvent(event)) return;
//     }
  
// if(event.type === 'mousemove'){
//  if(UIElement.focusedElement?.onMouseMove){
//     UIElement.focusedElement.onMouseMove(x, y);
//   }
// }

//         this.activeRoot.dispatchEvent(event);
      }
      
      _handleWheelEvent(e) {
        if (!this.activeRoot) return;
      
        const canvas = this.layoutRenderer.canvas;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const deltaY = e.deltaY;
        const scrollable = this._findScrollableAt(this.activeRoot, x, y);
        if (scrollable) {
          scrollable.handleScroll(deltaY);
          e.preventDefault();
        }
      }

      _findScrollableAt(root, x, y) {
        for (const child of root.children) {
          if (child.contains(x, y)) {
           if(typeof child.handleScroll === 'function')  return child;
           const nested = this._findScrollableAt(child, x, y);
if(nested) return nested;         
          }
        }
        return null;
      }
  
    // -------------------------------
    // Rendering
    // -------------------------------
  
    render() {
      const canvas = this.layoutRenderer.canvas;
      const ctx = this.layoutRenderer.ctx;
    
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
    
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
   
      if (this.activeRoot) {
        this.activeRoot.layout(0,0,canvasWidth, canvasHeight); // ✅ layout pass
        this.activeRoot.render();                          // ✅ render pass
      }

      if(this.overlayRoot) {
        this.overlayRoot.layout(0,0,canvasWidth, canvasHeight);
        this.overlayRoot.render();
      }
    }
    
  
    startRenderLoop() {
      const loop = () => {
        this.render();
        requestAnimationFrame(loop);
      };
      loop();
    }
  }
