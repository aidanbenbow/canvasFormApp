export class FormIconRenderer {
    constructor(eventBus) {
      this.eventBus = eventBus; // To emit form load events
    }
  
    render(box, rendererContext) {
      if (box.type !== 'textBox') return;
      const { ctx, hitCtx, hitRegistry, mode } = rendererContext;
  console.log(mode)
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
  
        const hitColor = box.hitColors[`icon${index}`] || box.hitColors.main;
        // Store clickable region for hit detection
        if (hitCtx) {
          
          hitCtx.fillStyle = hitColor;
          hitCtx.fillRect(pos.x, pos.y - iconSize, iconSize * iconText.length, iconSize);
        }

        // Register hit region action
        hitRegistry?.register(hitColor, {
            box,
            region: `icon${index}`,
            mode: mode,
            metadata: {
                formId: box.id,
                action: ()=> this.eventBus.emit('loadForm', {formId:box.id, mode})
            }
        })
      });
    }
    clear(rendererContext) {
        const { ctx, hitCtx } = rendererContext;
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        hitCtx?.clearRect(0, 0, hitCtx.canvas.width, hitCtx.canvas.height);
      }
  }