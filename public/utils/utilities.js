import { Box } from "../drawables/box.js";

export function generateHitHex() {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    return `#${hex}`;
}

export function getMousePosition(canvas,event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

export function normalizePos(canvas, pos) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  return {
    x: Math.floor((pos.x - rect.left) * dpr),
    y: Math.floor((pos.y - rect.top) * dpr),
  };
}

export function getHitHex(ctx, pos) {
     const hitHex = ctx.getImageData(pos.x, pos.y, 1, 1).data;
    const hex = ((hitHex[0] << 16) | (hitHex[1] << 8) | hitHex[2]).toString(16).padStart(6, '0');
    return `#${hex}`;
}

export function measureTextSize(text, fontSize, maxWidth = Infinity) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px Arial`;
    const metrics = ctx.measureText(text);
    const padding = 20; // Optional padding
    return {
      width: Math.min(metrics.width + padding, maxWidth),
      height: fontSize + padding
    };
  }

  export function createBoxFromFormItem(item, renderer) {
 
    return new Box(
        item.id,
      item.type,
      item.startPosition,
      item.size,
      item.text,
      item.color,
      renderer,
      item.actionKey || null,
      item.imageKey || null,
      
    );
  }

  export function loadImage(path) {
    const img = new Image();
    img.src = path;
    return img;
  }