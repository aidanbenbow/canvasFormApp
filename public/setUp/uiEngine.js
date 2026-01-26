import { SceneNode } from "../components/nodes/sceneNode.js";
import { ScreenManager } from "../managers/screenManager.js";
import { SystemUILayerFactory } from "./systemUiFactory.js";

export class UIEngine {
    constructor({ layoutStrategy, renderStrategy, dispatcher }) {
      this.dispatcher = dispatcher;
  
      this.root = new SceneNode({
        id: 'engine-root',
        layoutStrategy,
        renderStrategy,
        children: []
      });
  
      this.systemUIRoot = SystemUILayerFactory.create(dispatcher);
      this.root.add(this.systemUIRoot.root);
 
      this.screenManager = new ScreenManager(this.root);
    }
  
    mountScene(sceneRoot) {
      this.screenManager.loadScreen(sceneRoot);
      this.root.invalidate();
    }
  }