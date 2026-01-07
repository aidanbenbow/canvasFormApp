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

  // Convert screen → canvas
const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;
if(type==='click'){
    console.log(`Click at canvas coords: (${canvasX}, ${canvasY})`);
    console.log(`Canvas size: (${this.canvas.width}, ${this.canvas.height})`);
    console.log(e.clientX, e.clientY);
}
  // NEW: convert canvas → scene
  const { x, y } = this.pipeline.toSceneCoords(canvasX, canvasY);
  
      const root = this.pipeline.root
      const target = this.hitTest.hitTest(root,x, y, this.ctx);

      if(type==='click'){
        console.log(`Transformed to scene coords: (${x}, ${y})`);
      console.log(`Event type: ${type}, Target: ${target ? target.id : 'none'}`);
      }
      const event = new SceneEvent({
        type,
        x,
        y,
        target,
        originalEvent: e
      });
 
      this.dispatcher.dispatch(event);
    }
  }
  