import { PopUpNode } from "../components/nodes/popUpNode.js";
import { ACTIONS } from "../events/actions.js";

export const DropdownModule = {
  create(dispatcher, context) {
    const dropdownLayer = new PopUpNode({
      id: "dropdown-layer",
      layout: "popup",
      spacing: 0,
    });

    dropdownLayer.style.backgroundColor = null; // transparent
    dropdownLayer.visible = false;
    dropdownLayer.hitTestable = false;

    dispatcher.on(ACTIONS.DROPDOWN.SHOW, (menuNode) => {
      dropdownLayer.clearTransient();
      dropdownLayer.addTransient(menuNode);
      dropdownLayer.show();
    });

    dispatcher.on(ACTIONS.DROPDOWN.HIDE, () => {
      dropdownLayer.clearTransient();
      dropdownLayer.hide();
    });

    return dropdownLayer;
  },
};
