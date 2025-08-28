export class FormIconRenderer {
    constructor(eventBus) {
      this.eventBus = eventBus; // To emit form load events
    }
  
    render(box, rendererContext) {
      if (box.type !== 'textBox') return;
      const { ctx, hitCtx } = rendererContext;
  
      const iconText = box.text;
      const iconSize = 50;
      const positions = [
        { x: box.startPosition.x + 10, y: box.startPosition.y - 130 },
        { x: box.startPosition.x + box.size.width - 30, y: box.startPosition.y - 30 }
      ];
  
      ctx.fillStyle = 'red';
      ctx.font = `${iconSize}px Arial`;
  
      positions.forEach((pos, index) => {
        ctx.fillText(iconText, pos.x, pos.y);
  
        // Store clickable region for hit detection
        if (hitCtx) {
          const hitColor = box.hitColors[`icon${index}`] || box.hitColors.main;
          hitCtx.fillStyle = hitColor;
          hitCtx.fillRect(pos.x, pos.y - iconSize, iconSize * iconText.length, iconSize);
        }
      });
    }
  }