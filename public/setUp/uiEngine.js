import { RootSceneNode } from "../components/nodes/rootSceneNode.js";
import { SceneNode } from "../components/nodes/sceneNode.js";
import { ScreenManager } from "../managers/screenManager.js";
import { SystemUILayerFactory } from "./systemUiFactory.js";

export class UIEngine {
    constructor({ layoutStrategy, renderStrategy, dispatcher, context }) {
      this.dispatcher = dispatcher;
      this.context = context;
  console.log('UIEngine context:', context);
      this.root = new RootSceneNode({
        id: "ui-engine-root",
        context,
        layoutStrategy,
        renderStrategy
      });
  
      this.systemUIRoot = SystemUILayerFactory.create(dispatcher, context);
      this.root.setOverlayLayer(this.systemUIRoot.root);

      context.uiServices = {
        ...(context.uiServices ?? {}),
        ...this.systemUIRoot.services
      };
      
 
      this.screenManager = new ScreenManager(this.root);
    }
  
    mountScene(sceneRoot) {
      this.screenManager.loadScreen(sceneRoot);
      this.root.invalidate();
    }
  }