import { PopUpNode } from "../components/nodes/popUpNode.js";
import { ACTIONS } from "../events/actions.js";

export const PopupModule = {
    create(dispatcher) {
      const popup = new PopUpNode({
        id: 'popup-layer',
        layout: 'popup',
        
        spacing: 10
      });
  
      dispatcher.on(ACTIONS.KEYBOARD.SHOW, () => popup.show());
      dispatcher.on(ACTIONS.KEYBOARD.HIDE, () =>{
if(!popup.hasTransient()){
popup.hide();
} })
  

      return popup;
    }
  };