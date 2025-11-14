export class DragController {
   constructor(pipeline) {
       this.draggingElement = null;
       this.offsetX = 0;
       this.offsetY = 0;
       this.pipeline = pipeline;
   }
    startDrag(element, startX, startY) {
        this.draggingElement = element;
        this.draggingElement.isDragging = true;
        const bounds = element.getScaledBounds();
        if (bounds) {
            this.offsetX = startX - bounds.x;
            this.offsetY = startY - bounds.y;
        }
    }
    updateDrag(currentX, currentY) {
        if (!this.draggingElement) return;
        const newX = currentX - this.offsetX;
        const newY = currentY - this.offsetY;
        const snappedPosition = this.snapToGrid(newX, newY, 10);
        this.draggingElement.layoutManager.setLogicalBounds(this.draggingElement.id, {
            x: snappedPosition.x,
            y: snappedPosition.y,
            width: this.draggingElement.layoutManager.getLogicalBounds(this.draggingElement.id).width,
            height: this.draggingElement.layoutManager.getLogicalBounds(this.draggingElement.id).height
        });
        this.pipeline.invalidate()
    }
    endDrag() {
      if(!this.draggingElement) return;
      this.draggingElement.isDragging = false;
        this.draggingElement = null;
    }
    snapToGrid(x, y, gridSize = 10) {
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
      };
    }

  }
  