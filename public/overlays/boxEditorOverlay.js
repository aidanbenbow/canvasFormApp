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
        console.log(boxes);
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
    }
  
    handleMouseUp() {
        if(!this.editable) return;
      this.selectedBox = null;
      this.dragOffset = null;
    }
  }