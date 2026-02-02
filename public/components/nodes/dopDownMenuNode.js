import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownMenuRenderStrategy } from "../../renderers/nodeRenderers/dropDownMenuRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { ContainerNode } from "./containerNode.js";
import { LabelNode } from "./labelNode.js";

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

      // create LabelNode for each option
    options.forEach((text, i) => {
        const label = new LabelNode({
          id: `dropdown-option-${i}`,
          text,
          onSelect: () => {
            this.selectOption(i);
          },
          style: {
            font: "14px sans-serif",
            paddingY: 6,
            paddingX: 8,
            backgroundColor: "#eee"
          },
          hitTestStrategy: rectHitTestStrategy
        });
  
        this.add(label); // add as child node
      });
    }
    selectOption(index) {
        const chosen = this.options[index];
        if (!chosen) return;
    
        this.anchor.value = chosen;       // update input
        this.onSelect?.(chosen, index);   // propagate callback
        this.anchor.dropdownVisible = false;
        this.invalidate();
      }
  }
  