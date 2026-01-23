import { PopUpNode } from "../components/nodes/popUpNode.js";
import { ACTIONS } from "../events/actions.js";

export const PopupModule = {
    create(dispatcher) {
      const popup = new PopUpNode({
        id: 'popup-layer',
        layout: 'popup',
        backgroundColor: 'rgba(0,0,0,0.5)',
        spacing: 10
      });
  
      dispatcher.on(ACTIONS.KEYBOARD.SHOW, () => popup.show());
      dispatcher.on(ACTIONS.KEYBOARD.HIDE, () => popup.hide());
  
      return popup;
    }
  };