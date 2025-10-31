import { UIElement } from "./UiElement.js";

export class UIStage {
    constructor({ layoutManager, layoutRenderer }) {
      this.layoutManager = layoutManager;
      this.layoutRenderer = layoutRenderer;
  
      // Currently active root UI element
      this.activeRoot = null;
  
      // Optionally keep multiple roots
      this.roots = new Map();
  
      // Event listeners
      this._bindEvents();
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
      console.log('📤 Dispatching to root:', this.activeRoot?.id);
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
  
      window.addEventListener('keydown', e => {
        if (UIElement.focusedElement?.handleKeyDown) {
          UIElement.focusedElement.handleKeyDown(e);
        }
      });
    }
  
    _handleMouseEvent(e, type) {
        if (!this.activeRoot) return;
       // console.log('📍 Mouse event:');

        const canvas = this.layoutRenderer.canvas;
        const rect = canvas.getBoundingClientRect();
 //console.log('Mouse Event:', { type, clientX: e.clientX, clientY: e.clientY, rect });
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
      
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
     
        this.activeRoot.dispatchEvent({ type, x, y });
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
        this.activeRoot.layout(canvasWidth, canvasHeight); // ✅ layout pass
        this.activeRoot.render();                          // ✅ render pass
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
