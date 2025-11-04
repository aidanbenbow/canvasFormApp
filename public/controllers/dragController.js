export class DragController {
    constructor({ canvas, hitManager, layoutManager, pipeline, getMousePos, normalisePos }) {
      this.canvas = canvas;
      this.hitManager = hitManager;
      this.layoutManager = layoutManager;
      this.pipeline = pipeline;

      this.getMousePos = getMousePos;
        this.normalisePos = normalisePos;
  
      this.dragging = false;
      this.target = null;
      this.offset = { x: 0, y: 0 };
  
      this.attachListeners();
    }
  
    attachListeners() {
      document.addEventListener('mousedown', this.onDown.bind(this));
      document.addEventListener('mousemove', this.onMove.bind(this));
      document.addEventListener('mouseup', this.onUp.bind(this));
    }
  
    onDown(e) {
      const pos = this.getMousePos(this.canvas, e);
      const norm = this.normalisePos(pos);
      const hit = this.hitManager.getHitTarget(norm);
  
      if (hit && hit.draggable) {
        this.dragging = true;
        this.target = hit;
        this.offset = {
          x: norm.x - hit.layout.x,
          y: norm.y - hit.layout.y
        };
      }
    }
  
    onMove(e) {
      if (!this.dragging || !this.target) return;
  
      const pos = this.hitManager.getMousePos(this.canvas, e);
      const norm = this.hitManager.normalisePos(pos);
  
      const newX = norm.x - this.offset.x;
      const newY = norm.y - this.offset.y;
  
      this.target.layout.x = newX;
      this.target.layout.y = newY;
  
      this.layoutManager.place({
        id: this.target.id,
        x: newX,
        y: newY,
        width: this.target.layout.width,
        height: this.target.layout.height
      });
  
      this.pipeline.invalidate();
    }
  
    onUp() {
      this.dragging = false;
      this.target = null;
    }
  }
  