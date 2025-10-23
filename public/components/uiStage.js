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
  
      const rect = this.layoutRenderer.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      this.activeRoot.dispatchEvent({ type, x, y });
    }
  
    // -------------------------------
    // Rendering
    // -------------------------------
  
    render() {
      const ctx = this.layoutRenderer.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
      this.activeRoot?.render();
    }
  
    startRenderLoop() {
      const loop = () => {
        this.render();
        requestAnimationFrame(loop);
      };
      loop();
    }
  }
