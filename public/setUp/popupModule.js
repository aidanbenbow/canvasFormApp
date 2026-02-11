import { PopUpNode } from "../components/nodes/popUpNode.js";
import { ACTIONS } from "../events/actions.js";

export const PopupModule = {
    create(dispatcher) {
      const popup = new PopUpNode({
        id: 'popup-layer',
        layout: 'popup',
        
        spacing: 10
      });
  
    // Hook up dispatcher actions
    dispatcher.on(ACTIONS.POPUP?.SHOW, (node) => {
      popup.addTransient(node);
      popup.show();
    });

    dispatcher.on(ACTIONS.POPUP?.HIDE, () => {
      popup.clearTransient();
      popup.hide();
    });
      return popup;
    }
  };