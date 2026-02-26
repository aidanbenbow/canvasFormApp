import { Box } from "../drawables/box.js";
import { utilsRegister } from "./register.js";

function mapResponsesToLabelKeys(rawResponses = {}, formFields = []) {
  const responseEntries = Object.entries(rawResponses || {});
  if (!responseEntries.length) return {};

  const normalizedFields = Array.isArray(formFields) ? formFields : [];
  const fieldsById = new Map(
    normalizedFields
      .filter((field) => field?.id)
      .map((field) => [field.id, field])
  );

  const boundLabelsByTargetFieldId = new Map();
  for (const field of normalizedFields) {
    if (!field || field.type !== 'label') continue;
    const targetFieldId = String(field.forFieldId || '').trim();
    if (!targetFieldId) continue;

    const boundLabelText = String(field.text || field.label || '').trim();
    if (!boundLabelText) continue;

    if (!boundLabelsByTargetFieldId.has(targetFieldId)) {
      boundLabelsByTargetFieldId.set(targetFieldId, boundLabelText);
    }
  }

  const mapped = {};
  const usedKeys = new Set();

  for (const [responseKey, responseValue] of responseEntries) {
    const fieldDef = fieldsById.get(responseKey);
    if (!fieldDef) continue;

    const preferredLabel = boundLabelsByTargetFieldId.get(responseKey);
    const storageKey = buildLabeledStorageKey(fieldDef, responseKey, usedKeys, preferredLabel);
    mapped[storageKey] = responseValue;
  }

  if (Object.keys(mapped).length > 0) return mapped;
  return rawResponses;
}

function buildLabeledStorageKey(fieldDef, fallbackKey, usedKeys = new Set(), preferredLabel = null) {
  const baseName = slugifyFieldName(
    preferredLabel
    || fieldDef?.label
    || fieldDef?.text
    || fieldDef?.placeholder
    || fallbackKey
  );

  const seed = baseName;

  if (!usedKeys.has(seed)) {
    usedKeys.add(seed);
    return seed;
  }

  let sequence = 2;
  let candidate = `${seed}-${sequence}`;
  while (usedKeys.has(candidate)) {
    sequence += 1;
    candidate = `${seed}-${sequence}`;
  }

  usedKeys.add(candidate);
  return candidate;
}

function slugifyFieldName(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  const cleaned = normalized.replace(/^-+|-+$/g, '');
  return cleaned || 'field';
}

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
  
    return `${Math.round((logicalSize) * canvasHeight)}px Arial`;
  }
  
  