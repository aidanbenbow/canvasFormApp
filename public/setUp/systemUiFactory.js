import { SceneNode } from "../components/nodes/sceneNode.js";
import { containerRenderer } from "../renderers/containerRenderer.js";
import { overlayLayoutStrategy } from "../strategies/overlayLayout.js";
import { KeyboardModule } from "./keyBoardModule.js";
import { PopupModule } from "./popupModule.js";

export const SystemUILayerFactory = {
    create(dispatcher, context) {
      const systemRoot = new SceneNode({
        id: 'system-ui-root',
        context,
        style: {
          background: 'transparent'  // transparent background
        },
        layoutStrategy: overlayLayoutStrategy(),
        renderStrategy: containerRenderer
      });
  
      const popupLayer = PopupModule.create(dispatcher);
      const keyboardLayer = KeyboardModule.create(dispatcher, context);
  console.log("Created popupLayer:", popupLayer);
  console.log("Created keyboardLayer:", keyboardLayer);
      popupLayer.add(keyboardLayer);
      systemRoot.add(popupLayer);
  
      return {
        root: systemRoot,
        services:{
          popupLayer,
          keyboardLayer
        }
      }
    }
  };