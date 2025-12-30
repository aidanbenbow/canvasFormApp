import { SceneEvent } from "./sceneEvent.js";
import { SceneEventDispatcher } from "./sceneEventDispatcher";
import { SceneHitTestSystem } from "./sceneHitTestSystem.js";

export class SceneInputSystem {
    constructor({ canvas, root, ctx }) {
      this.canvas = canvas;
      this.root = root;
      this.ctx = ctx;
  
      this.hitTest = new SceneHitTestSystem(root);
      this.dispatcher = new SceneEventDispatcher();
  
      this._bind();
    }
  
    _bind() {
      this.canvas.addEventListener('mousemove', e => this._handle(e, 'mousemove'));
      this.canvas.addEventListener('mousedown', e => this._handle(e, 'mousedown'));
      this.canvas.addEventListener('mouseup', e => this._handle(e, 'mouseup'));
      this.canvas.addEventListener('click', e => this._handle(e, 'click'));
    }
  
    _handle(e, type) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);
  
      const target = this.hitTest.hitTest(x, y, this.ctx);
  
      const event = new SceneEvent({
        type,
        x,
        y,
        target,
        originalEvent: e
      });
  
      this.dispatcher.dispatch(event, this.root);
    }
  }
  