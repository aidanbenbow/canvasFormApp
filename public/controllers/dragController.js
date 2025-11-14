export class DragController {
   constructor(pipeline) {
       this.draggingElement = null;
       this.offsetX = 0;
       this.offsetY = 0;
       this.pipeline = pipeline;
   }
    startDrag(element, startX, startY) {
        this.draggingElement = element;
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
        this.draggingElement.layoutManager.setLogicalBounds(this.draggingElement.id, {
            x: newX,
            y: newY,
            width: this.draggingElement.layoutManager.getLogicalBounds(this.draggingElement.id).width,
            height: this.draggingElement.layoutManager.getLogicalBounds(this.draggingElement.id).height
        });
        this.pipeline.invalidate()
    }
    endDrag() {
        this.draggingElement = null;
    }

  }
  