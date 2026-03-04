import { RootSceneNode } from "../components/nodes/rootSceneNode.js";
import { SceneNode } from "../components/nodes/sceneNode.js";
import { BaseEngine } from "../components/engines/baseEngine.js";
import { ScreenManager } from "../managers/screenManager.js";
import { SystemUILayerFactory } from "./systemUiFactory.js";

export class UIEngine extends BaseEngine {
    constructor({ layoutStrategy, renderStrategy, dispatcher, context }) {
      super({ id: 'uiEngine', context });
      this.dispatcher = dispatcher;

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

      this.mount();
    }

    mount() {
      super.mount();
      return this.root;
    }

    setContext(context) {
      this.context = context;
      this.screenManager.setContext(context);
    }
  
    mountScene(sceneRoot) {
      this.screenManager.loadScreen(sceneRoot);
      this.root.invalidate();
    }
  }