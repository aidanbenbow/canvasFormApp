import { SceneNode } from "../components/nodes/sceneNode.js";
import { KeyboardModule } from "./keyBoardModule.js";
import { PopupModule } from "./popupModule.js";

export const SystemUILayerFactory = {
    create(dispatcher) {
      const systemRoot = new SceneNode({
        id: 'system-ui-root',
        layoutStrategy: overlayLayoutStrategy,
        renderStrategy: containerRenderer
      });
  
      const popupLayer = PopupModule.create(dispatcher);
      const keyboardLayer = KeyboardModule.create(dispatcher);
  
      systemRoot.add(popupLayer);
      systemRoot.add(keyboardLayer);
  
      return systemRoot;
    }
  };