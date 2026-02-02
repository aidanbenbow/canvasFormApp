import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownMenuRenderStrategy } from "../../renderers/nodeRenderers/dropDownMenuRenderer.js";
import { ContainerNode } from "./containerNode.js";

export class DropdownMenuNode extends ContainerNode {
    constructor({anchor, options, onSelect }) {
      super({
        id: "dropdown-menu",
        layoutStrategy: layoutRegistry["anchored"](),  // use popup layout for dropdown menu
        renderStrategy: dropdownMenuRenderStrategy,      // custom renderer for dropdown menu
        children: []
      });
  this.anchor = anchor; // reference to dropdown input node
      this.options = options;
      this.onSelect = onSelect;
    }
  }
  