export const photoRenderer = {
  render(node, ctx) {
    const bounds = node.bounds;
    if (!bounds) return;

    const x = bounds.x;
    const y = bounds.y;
    const width = bounds.width;
    const height = bounds.height;

    const radius = node.style?.radius ?? 8;
    const borderColor = node.style?.borderColor ?? '#d1d5db';
    const background = node.style?.backgroundColor ?? '#f3f4f6';

    ctx.save();
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = background;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (node.image && node.image.complete && node.image.naturalWidth > 0) {
      ctx.save();
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.clip();

      const imageRatio = node.image.naturalWidth / node.image.naturalHeight;
      const boxRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = x;
      let offsetY = y;

      if (imageRatio > boxRatio) {
        drawHeight = height;
        drawWidth = drawHeight * imageRatio;
        offsetX = x - (drawWidth - width) / 2;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / imageRatio;
        offsetY = y - (drawHeight - height) / 2;
      }

      ctx.drawImage(node.image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    } else {
      ctx.font = node.style?.font || '18px sans-serif';
      ctx.fillStyle = node.style?.textColor || '#6b7280';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.src ? 'Loading photo...' : 'No photo URL', x + width / 2, y + height / 2);
    }

    ctx.restore();
  }
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  if (r === 0) {
    ctx.rect(x, y, width, height);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
