import { rectHitTestStrategy } from '../../strategies/rectHitTest.js';
import { photoRenderer } from '../../renderers/nodeRenderers/photoRenderer.js';
import { SceneNode } from './sceneNode.js';

export class PhotoNode extends SceneNode {
  constructor({ id, src = '', brightness = 100, style = {} }) {
    super({
      id,
      layoutStrategy: null,
      renderStrategy: photoRenderer,
      hitTestStrategy: rectHitTestStrategy
    });

    this.src = normalizePhotoSource(src);
    this.brightness = normalizeBrightness(brightness);
    this.image = null;
    this.style = {
      width: 800,
      height: isSmallScreen() ? 360 : 280,
      radius: 8,
      borderColor: '#d1d5db',
      backgroundColor: '#f3f4f6',
      textColor: '#6b7280',
      font: isSmallScreen() ? '28px sans-serif' : '18px sans-serif',
      ...style
    };

    this.loadImage();
  }

  setSource(nextSource) {
    this.src = normalizePhotoSource(nextSource);
    this.loadImage();
    this.invalidate();
  }

  setBrightness(nextBrightness) {
    this.brightness = normalizeBrightness(nextBrightness);
    this.invalidate();
  }

  loadImage() {
    const normalizedSource = normalizePhotoSource(this.src);
    this.src = normalizedSource;

    if (!this.src) {
      this.image = null;
      this.invalidate();
      return;
    }

    const image = new Image();
    image.onload = () => {
      this.image = image;
      this.invalidate();
    };
    image.onerror = () => {
      this.image = null;
      this.invalidate();
    };
    image.src = this.src;
  }

  measure(constraints) {
    const preferredWidth = this.style.width ?? constraints.maxWidth;
    const width = Math.min(preferredWidth, constraints.maxWidth);
    const preferredHeight = this.style.height ?? 280;
    const height = Math.min(preferredHeight, constraints.maxHeight);
    this.measured = { width, height };
    return this.measured;
  }

  layout(bounds) {
    this.bounds = bounds;
  }
}

function normalizeBrightness(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return 100;
  return Math.max(0, Math.min(300, raw));
}

function normalizePhotoSource(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (raw.toLowerCase().startsWith('s3://')) {
    const withoutScheme = raw.slice(5);
    const slashIndex = withoutScheme.indexOf('/');
    if (slashIndex === -1) return '';

    const bucket = withoutScheme.slice(0, slashIndex);
    const key = withoutScheme.slice(slashIndex + 1);
    if (!bucket || !key) return '';

    return `https://${bucket}.s3.eu-north-1.amazonaws.com/${encodeURI(key)}`;
  }

  return raw;
}

function isSmallScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}
