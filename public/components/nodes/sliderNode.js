import { sliderRenderer } from '../../renderers/nodeRenderers/sliderRenderer.js';
import { rectHitTestStrategy } from '../../strategies/rectHitTest.js';
import { SceneNode } from './sceneNode.js';

export class SliderNode extends SceneNode {
  constructor({
    id,
    min = 0,
    max = 200,
    value = 100,
    step = 1,
    label = 'Brightness',
    onChange,
    visible = true,
    hitTestable = true,
    style = {}
  }) {
    super({
      id,
      visible,
      layoutStrategy: null,
      renderStrategy: sliderRenderer,
      hitTestStrategy: rectHitTestStrategy
    });

    this.hitTestable = Boolean(hitTestable);

    this.min = Number.isFinite(min) ? min : 0;
    this.max = Number.isFinite(max) ? max : 200;
    this.step = Math.max(1, Number(step) || 1);
    this.label = label;
    this.onChange = onChange;
    this.dragging = false;

    this.style = {
      width: 800,
      minHeight: 48,
      fillWidth: true,
      trackHeight: 6,
      thumbRadius: 10,
      borderColor: '#d1d5db',
      textColor: '#1f2937',
      trackColor: '#cbd5e1',
      activeTrackColor: '#2563eb',
      thumbColor: '#2563eb',
      font: isSmallScreen() ? '24px sans-serif' : '14px sans-serif',
      paddingX: isSmallScreen() ? 16 : 10,
      paddingY: isSmallScreen() ? 12 : 8,
      ...style
    };

    this.value = this.clampAndNormalize(value);
    this._windowPointerMoveHandler = null;
    this._windowPointerUpHandler = null;
  }

  setValue(nextValue, { silent = false } = {}) {
    const normalized = this.clampAndNormalize(nextValue);
    if (normalized === this.value) return;
    this.value = normalized;
    if (!silent) {
      this.onChange?.(this.value);
    }
    this.invalidate();
  }

  setValueFromX(sceneX, options = {}) {
    if (!this.bounds) return;

    const trackStartX = this.bounds.x + (this.style.paddingX ?? 10);
    const trackEndX = this.bounds.x + this.bounds.width - (this.style.paddingX ?? 10);
    const trackWidth = Math.max(1, trackEndX - trackStartX);
    const ratio = (sceneX - trackStartX) / trackWidth;
    const rawValue = this.min + Math.max(0, Math.min(1, ratio)) * (this.max - this.min);
    this.setValue(rawValue, options);
  }

  onPointerDown(sceneX, sceneY) {
    if (!this.isPointerInside(sceneX, sceneY)) return;
    this.dragging = true;
    this.setValueFromX(sceneX);
    this.attachWindowDragListeners();
  }

  onPointerUp() {
    this.dragging = false;
    this.detachWindowDragListeners();
  }

  onEvent(event) {
    if (!event) return false;

    if (event.type === 'mousedown') {
      this.dragging = true;
      this.setValueFromX(event.x);
      this.attachWindowDragListeners();
      return true;
    }

    if (event.type === 'mousemove' && this.dragging) {
      this.setValueFromX(event.x);
      return true;
    }

    if (event.type === 'mouseup') {
      this.dragging = false;
      this.detachWindowDragListeners();
      return true;
    }

    return false;
  }

  measure(constraints) {
    const preferredWidth = this.style.width ?? constraints.maxWidth;
    const width = Math.min(preferredWidth, constraints.maxWidth);
    const preferredHeight = this.style.minHeight ?? 48;
    const height = Math.min(preferredHeight, constraints.maxHeight);
    this.measured = { width, height };
    return this.measured;
  }

  layout(bounds) {
    this.bounds = bounds;
  }

  clampAndNormalize(nextValue) {
    const raw = Number(nextValue);
    const finite = Number.isFinite(raw) ? raw : this.value ?? this.min;
    const clamped = Math.max(this.min, Math.min(this.max, finite));
    const stepped = Math.round((clamped - this.min) / this.step) * this.step + this.min;
    return Math.max(this.min, Math.min(this.max, stepped));
  }

  isPointerInside(sceneX, sceneY) {
    const b = this.bounds;
    if (!b) return false;
    return sceneX >= b.x && sceneX <= b.x + b.width && sceneY >= b.y && sceneY <= b.y + b.height;
  }

  attachWindowDragListeners() {
    if (typeof window === 'undefined') return;
    if (this._windowPointerMoveHandler || this._windowPointerUpHandler) return;

    this._windowPointerMoveHandler = (event) => {
      if (!this.dragging) return;

      const point = this.clientEventToScenePoint(event);
      if (!point) return;
      this.setValueFromX(point.x);
    };

    this._windowPointerUpHandler = () => {
      this.dragging = false;
      this.detachWindowDragListeners();
    };

    window.addEventListener('mousemove', this._windowPointerMoveHandler);
    window.addEventListener('mouseup', this._windowPointerUpHandler);
    window.addEventListener('pointermove', this._windowPointerMoveHandler);
    window.addEventListener('pointerup', this._windowPointerUpHandler);
    window.addEventListener('pointercancel', this._windowPointerUpHandler);
    window.addEventListener('touchmove', this._windowPointerMoveHandler, { passive: true });
    window.addEventListener('touchend', this._windowPointerUpHandler);
    window.addEventListener('touchcancel', this._windowPointerUpHandler);
  }

  detachWindowDragListeners() {
    if (typeof window === 'undefined') return;

    if (this._windowPointerMoveHandler) {
      window.removeEventListener('mousemove', this._windowPointerMoveHandler);
      window.removeEventListener('pointermove', this._windowPointerMoveHandler);
      window.removeEventListener('touchmove', this._windowPointerMoveHandler);
      this._windowPointerMoveHandler = null;
    }

    if (this._windowPointerUpHandler) {
      window.removeEventListener('mouseup', this._windowPointerUpHandler);
      window.removeEventListener('pointerup', this._windowPointerUpHandler);
      window.removeEventListener('pointercancel', this._windowPointerUpHandler);
      window.removeEventListener('touchend', this._windowPointerUpHandler);
      window.removeEventListener('touchcancel', this._windowPointerUpHandler);
      this._windowPointerUpHandler = null;
    }
  }

  clientEventToScenePoint(event) {
    const touch = event?.touches?.[0] || event?.changedTouches?.[0] || null;
    const clientX = touch?.clientX ?? event?.clientX;
    const clientY = touch?.clientY ?? event?.clientY;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;

    const canvas = this.context?.canvas ?? this.context?.ctx?.canvas ?? null;
    const pipeline = this.context?.pipeline;
    if (!canvas || !pipeline?.toSceneCoords) return null;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    return pipeline.toSceneCoords(canvasX, canvasY);
  }
}

function isSmallScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}
