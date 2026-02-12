import { SceneEvent } from "./sceneEvent.js";
import { SceneEventDispatcher } from "./sceneEventDispatcher.js";
import { SceneHitTestSystem } from "./sceneHitTestSystem.js";

export class SceneInputSystem {
    constructor({ canvas, pipeline, ctx }) {
      this.canvas = canvas;
      this.pipeline = pipeline;
      this.ctx = ctx;
  
      this.hitTest = new SceneHitTestSystem();
      this.dispatcher = new SceneEventDispatcher();
  
      this._bind();
    }
  
    _bind() {
      this.canvas.addEventListener('mousemove', e => this._handle(e, 'mousemove'));
      this.canvas.addEventListener('mousedown', e => this._handle(e, 'mousedown'));
      this.canvas.addEventListener('mouseup', e => this._handle(e, 'mouseup'));
      this.canvas.addEventListener('click', e => this._handle(e, 'click'));
      this.canvas.addEventListener('dblclick', e => this._handle(e, 'dblclick'));
      this.canvas.addEventListener('wheel', e => this._handleWheel(e));

      this.canvas.addEventListener('touchstart', e => this._handleTouch(e, 'mousedown'), { passive: false });
      this.canvas.addEventListener('touchmove', e => this._handleTouch(e, 'mousemove'), { passive: false });
      this.canvas.addEventListener('touchend', e => this._handleTouch(e, 'mouseup'));

    }
  
    _handle(e, type) {
      this._handleFromClient(type, e.clientX, e.clientY, e);
    }

    _handleTouch(e, type) {
      if (type === "mousemove") {
        e.preventDefault();
      }

      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;

      this._handleFromClient(type, touch.clientX, touch.clientY, e);
    }

    _handleFromClient(type, clientX, clientY, originalEvent) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;

      const { x, y } = this.pipeline.toSceneCoords(canvasX, canvasY);
      this.handlePointer(type, x, y);
      const root = this.pipeline.root;
      const target = this.hitTest.hitTest(root, x, y, this.ctx);

      const event = new SceneEvent({
        type,
        x,
        y,
        target,
        originalEvent
      });

      this.dispatcher.dispatch(event);
    }
    handlePointer(type, x, y) {
      const root = this.pipeline.root;
      const target = this.hitTest.hitTest(root, x, y, this.ctx);
    
      // Track hover transitions
      if (target !== this.lastPointerTarget) {
        // Pointer left previous node
        if (this.lastPointerTarget) {
          this.lastPointerTarget.onPointerLeave?.();
        }
    
        // Pointer entered new node
        if (target) {
          target.onPointerEnter?.();
        }
    
        this.lastPointerTarget = target;
      }
    
      // No target → nothing to do
      if (!target) return;
    
      // Pointer down/up
      if (type === "mousedown") {
        target.onPointerDown?.(x,y);
      }
    
      if (type === "mouseup") {
        target.onPointerUp?.();
      }

      if (type === "dblclick") {
        target.onPointerDoubleClick?.(x, y);
      }
    }
    _handleWheel(e) {
      e.preventDefault(); // prevent page scrolling
     
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
  
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
  
      // Convert to scene coords
      const { x, y } = this.pipeline.toSceneCoords(canvasX, canvasY);
  
      // Hit test to find which scrollable container is under pointer
      const root = this.pipeline.root;
      const target = this.hitTest.hitTest(root, x, y, this.ctx);
      const event = new SceneEvent({
        type: "wheel",
        x,
        y,
        target,
        originalEvent: e
    });

    this.dispatcher.dispatch(event); // consistent event propagation

  }
  
  }
  