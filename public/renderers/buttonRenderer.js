export function buttonRenderer(ctx, node) {
    const { x, y, width, height } = node.bounds;
    const { label, state, style } = node;
  
    ctx.save();
  
    // 🎨 Background
    let bg = '#f5f5f5';
    if (state.pressed) bg = '#dcdcdc';
    else if (state.hovered) bg = '#eaeaea';
  
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, width, height, style.radius);
    ctx.fill();
  
    // 🧱 Border
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.stroke();
  
    // 🔤 Text
    ctx.font = style.font;
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    ctx.fillText(
      label,
      x + width / 2,
      y + height / 2
    );
  
    ctx.restore();
  }
  
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  