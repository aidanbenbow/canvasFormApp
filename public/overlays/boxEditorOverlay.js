export class BoxEditorOverlay {
    constructor(boxes = []) {
      this.type = 'boxEditorOverlay';
      this.boxes = boxes;
      this.selectedBox = null;
      this.dragOffset = null;
      this.editable = false
    }
    setMode(mode){
      this.editable = mode === 'admin'
    }
    setBoxes(boxes) {
      
        this.boxes = boxes;
        }
        getBoxes() {
          return this.boxes;
        }
        addBox(box) {
          this.boxes.push(box);
        }
  
    render({ ctx }) {
      if(!this.editable) return;
      ctx.save();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
  
      this.boxes.forEach(box => {
        const { x, y } = box.startPosition;
        const { width, height } = box.size;
        const deleteSize = 16;
        const deleteX = x + box.size.width - deleteSize - 4;
        const deleteY = y + 4;

        const resizeSize = 12;
const resizeX = x + width - resizeSize;
const resizeY = y + height - resizeSize;

ctx.fillStyle = 'green';
ctx.fillRect(resizeX, resizeY, resizeSize, resizeSize);
box._resizeBounds = {
  x: resizeX,
  y: resizeY,
  width: resizeSize,
  height: resizeSize
};

      
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(deleteX + deleteSize / 2, deleteY + deleteSize / 2, deleteSize / 2, 0, Math.PI * 2);
        ctx.fill();
      
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('X', deleteX + 4, deleteY + 12);
      
      
        ctx.strokeRect(x, y, width, height);
  
        if (box === this.selectedBox) {
          ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
          ctx.fillRect(x, y, width, height);
        }
      });
  
      ctx.restore();
    }
  
    handleMouseDown(x, y) {
        if(!this.editable) return;
      for (const box of this.boxes) {
        const { x: bx, y: by } = box.startPosition;
        const { width, height } = box.size;

        const deleteSize = 16;
  const deleteX = bx + width - deleteSize - 4;
  const deleteY = by + 4;

  const withinDelete =
    x >= deleteX &&
    x <= deleteX + deleteSize &&
    y >= deleteY &&
    y <= deleteY + deleteSize;

  if (withinDelete) {
    this.boxes = this.boxes.filter(b => b !== box);
    this.selectedBox = null;
    return;
  }

  const r = box._resizeBounds;
  const withinResize =
    r && x >= r.x && x <= r.x + r.width &&
    y >= r.y && y <= r.y + r.height;
  
  if (withinResize) {
    this.selectedBox = box;
    this.resizing = true;
    this.dragOffset = { x, y }; // starting point
    return;
  }
  
  
        if (x >= bx && x <= bx + width && y >= by && y <= by + height) {
          this.selectedBox = box;
          this.dragOffset = { x: x - bx, y: y - by };
          return;
        }
      }
    }
  
    handleMouseMove(x, y) {
        if(!this.editable) return;
      if (this.selectedBox && this.dragOffset) {
        const newX = x - this.dragOffset.x;
        const newY = y - this.dragOffset.y;
        this.selectedBox.moveTo({ x: newX, y: newY });
      }

      if (this.selectedBox && this.resizing) {
        const dx = x - this.dragOffset.x;
        const dy = y - this.dragOffset.y;
      
        const newWidth = this.selectedBox.size.width + dx;
        const newHeight = this.selectedBox.size.height + dy;
      
        this.selectedBox.resizeTo({ width: newWidth, height: newHeight });
        this.dragOffset = { x, y }; // update for smooth resizing
      }
      
    }
  
    handleMouseUp() {
        if(!this.editable) return;
      this.selectedBox = null;
      this.dragOffset = null;
      this.resizing = false;
    }
  }