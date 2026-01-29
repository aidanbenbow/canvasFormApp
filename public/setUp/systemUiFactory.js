import { SceneNode } from "../components/nodes/sceneNode.js";
import { containerRenderer } from "../renderers/containerRenderer.js";
import { overlayLayoutStrategy } from "../strategies/overlayLayout.js";
import { KeyboardModule } from "./keyBoardModule.js";
import { PopupModule } from "./popupModule.js";

export const SystemUILayerFactory = {
    create(dispatcher) {
      const systemRoot = new SceneNode({
        id: 'system-ui-root',
        style: {
          background: '#93B5E1'  // transparent background
        },
        layoutStrategy: overlayLayoutStrategy(),
        renderStrategy: containerRenderer
      });
  
      const popupLayer = PopupModule.create(dispatcher);
      const keyboardLayer = KeyboardModule.create(dispatcher);
  
      popupLayer.add(keyboardLayer);
      systemRoot.add(popupLayer);
      
  
      return {
        root: systemRoot
      }
    }
  };