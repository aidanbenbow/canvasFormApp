import { Box } from "../drawables/box.js";
import { utilsRegister } from "./register.js";

export function generateHitHex() {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    return `#${hex}`;
}

export function getMousePosition(canvas,event) {
  if (!canvas || typeof canvas.getBoundingClientRect !== 'function') {
    console.warn('Invalid canvas passed to getMousePosition:', canvas);
    return { x: 0, y: 0 };
  }
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

export function getLogicalMousePosition(canvas, event) {
  const canvasPos = getMousePosition(canvas, event);
  return scaleFromCanvas(canvasPos, canvas.width, canvas.height);
}


export function normalizePos(canvasPos) {

  const dpr = window.devicePixelRatio || 1;

  return {
    x: Math.floor(canvasPos.x * dpr),
    y: Math.floor(canvasPos.y * dpr)
  };
}

export function getHitHex(ctx, pos) {
  if (!Number.isInteger(pos.x) || !Number.isInteger(pos.y)) {
    console.warn('Invalid pixel coordinates for getImageData:', pos);
    return '#000000'; // fallback
  }
     const hitHex = ctx.getImageData(pos.x, pos.y, 1, 1).data;
    const hex = ((hitHex[0] << 16) | (hitHex[1] << 8) | hitHex[2]).toString(16).padStart(6, '0');
    return `#${hex}`;
}

export function getHitHexFromEvent(canvas, ctx, event) {
  const canvasPos = getMousePosition(canvas, event);
  const normPos = normalizePos( canvasPos);
  

  return getHitHex(ctx, normPos);
}


export function measureTextSize(text, fontSize, maxWidth = Infinity) {
  if (typeof text !== 'string') text = ''; // ✅ fallback to empty string
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px Arial`;
    const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  const lineHeight = fontSize * 1.2;
  const padding = 20;

  const width = Math.min(
    Math.max(...lines.map(line => ctx.measureText(line).width)) + padding,
    maxWidth
  );
  const height = lines.length * lineHeight + padding;

  return { width, height };
  }

  export function createBoxFromFormItem(item, renderer) {
    return new Box({
      id: item.id,
      type: item.type,
      startPosition: item.startPosition || { x: 50, y: 50 },
      size: item.size || { width: 100, height: 40 },
      text: item.text || '',
      label: item.label || 'Label',
      fill: item.color || '#ffffff',
      renderer,
      action: item.action || null,
      imageKey: item.imageKey || null
    });
  }
  
  

  export function loadImage(path) {
    const img = new Image();
    img.src = path;
    return img;
  }
  
  export function scaleToCanvas(pos, canvasWidth, canvasHeight) {
    const { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT } = utilsRegister.get('layout', 'getLogicalDimensions')();
    
    return {
      x: (pos.x / LOGICAL_WIDTH) * canvasWidth,
      y: (pos.y / LOGICAL_HEIGHT) * canvasHeight
    };
  }

  export function scaleFromCanvas(pos, canvasWidth, canvasHeight) {
    const { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT } = utilsRegister.get('layout', 'getLogicalDimensions')();
 
    return {
      x: (pos.x / canvasWidth) * LOGICAL_WIDTH,
      y: (pos.y / canvasHeight) * LOGICAL_HEIGHT
    };
  }

  export function scaleRectToCanvas(rect, canvasWidth, canvasHeight) {
    const { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT } = utilsRegister.get('layout', 'getLogicalDimensions')();
    return {
      x: (rect.x / LOGICAL_WIDTH) * canvasWidth,
      y: (rect.y / LOGICAL_HEIGHT) * canvasHeight,
      width: (rect.width / LOGICAL_WIDTH) * canvasWidth,
      height: (rect.height / LOGICAL_HEIGHT) * canvasHeight
    };
  }

  export function getLogicalFontSize(logicalSize, canvasHeight) {
    const { height: LOGICAL_HEIGHT } = utilsRegister.get('layout', 'getLogicalDimensions')();
    return `${Math.round((logicalSize / LOGICAL_HEIGHT) * canvasHeight)}px Arial`;
  }
  
  