export const sliderRenderer = {
  render(node, ctx) {
    const bounds = node.bounds;
    if (!bounds) return;

    const x = bounds.x;
    const y = bounds.y;
    const width = bounds.width;
    const height = bounds.height;

    const paddingX = node.style?.paddingX ?? 10;
    const paddingY = node.style?.paddingY ?? 8;
    const trackHeight = node.style?.trackHeight ?? 6;
    const thumbRadius = node.style?.thumbRadius ?? 10;
    const font = node.style?.font ?? '14px sans-serif';

    const min = Number(node.min ?? 0);
    const max = Number(node.max ?? 100);
    const value = Number(node.value ?? min);
    const denominator = Math.max(1, max - min);
    const ratio = Math.max(0, Math.min(1, (value - min) / denominator));

    const label = `${node.label || 'Brightness'}: ${Math.round(value)}%`;
    const labelY = y + paddingY + 10;

    const trackStartX = x + paddingX;
    const trackEndX = x + width - paddingX;
    const trackWidth = Math.max(1, trackEndX - trackStartX);
    const trackY = y + height - paddingY - trackHeight;
    const thumbX = trackStartX + ratio * trackWidth;
    const thumbY = trackY + trackHeight / 2;

    ctx.save();

    ctx.font = font;
    ctx.fillStyle = node.style?.textColor ?? '#1f2937';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, trackStartX, labelY);

    ctx.fillStyle = node.style?.trackColor ?? '#cbd5e1';
    ctx.fillRect(trackStartX, trackY, trackWidth, trackHeight);

    ctx.fillStyle = node.style?.activeTrackColor ?? '#2563eb';
    ctx.fillRect(trackStartX, trackY, Math.max(0, thumbX - trackStartX), trackHeight);

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
    ctx.fillStyle = node.style?.thumbColor ?? '#2563eb';
    ctx.fill();

    ctx.strokeStyle = node.style?.borderColor ?? '#d1d5db';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
};
