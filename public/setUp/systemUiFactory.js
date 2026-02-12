import { SceneNode } from "../components/nodes/sceneNode.js";
import { containerRenderer } from "../renderers/containerRenderer.js";
import { overlayLayoutStrategy } from "../strategies/overlayLayout.js";
import { DropdownModule } from "./dropDownModule.js";
import { KeyboardModule } from "./keyBoardModule.js";
import { PopupModule } from "./popupModule.js";
import { ToastModule } from "./toastModule.js";


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
      const toastLayer = ToastModule.create(dispatcher, context);
 const dropDownLayer = DropdownModule.create(dispatcher, context);
 
 systemRoot.add(dropDownLayer);
 systemRoot.add(keyboardLayer);
      systemRoot.add(popupLayer);
        systemRoot.add(toastLayer);
      
      return {
        root: systemRoot,
        services:{
          popupLayer,
          keyboardLayer,
          toastLayer,
          dropDownLayer
        }
      }
    }
  };