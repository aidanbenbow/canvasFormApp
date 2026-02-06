export const containerRenderer = {
    render(node, ctx) {
      const b = node.bounds;
      if (!b) return;
  
      // 1️⃣ Clip to container bounds
      if(node.scroll) {
    ctx.beginPath();
    ctx.rect(b.x, b.y, b.width, b.height);
    ctx.clip();}
  
      if (node.style?.background) {
        ctx.fillStyle = node.style.background;
        ctx.fillRect(b.x, b.y, b.width, b.height);
      }
  
      if (node.style?.border) {
        const { color = '#000', width = 1 } = node.style.border;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      }
      
// 4️⃣ Apply scroll translation if scrollable
if (node.scroll) node.scroll.apply(ctx);
   
    }
  };
  