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
    }
  
    _handle(e, type) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
const scaleY = this.canvas.height / rect.height;

const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;

  // NEW: convert canvas → scene
  const { x, y } = this.pipeline.toSceneCoords(canvasX, canvasY);
  
      const root = this.pipeline.root
      const target = this.hitTest.hitTest(root,x, y, this.ctx);
 //console.log(root);
      const event = new SceneEvent({
        type,
        x,
        y,
        target,
        originalEvent: e
      });
 console.log("Dispatching event:", event.type, "to target:", target ? target.id : "none");
      this.dispatcher.dispatch(event);
    }
  }
  