import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownMenuRenderStrategy } from "../../renderers/nodeRenderers/dropDownMenuRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { ContainerNode } from "./containerNode.js";
import { LabelNode } from "./labelNode.js";

export class DropdownMenuNode extends ContainerNode {
    constructor({anchor,context, options, onSelect, selectedIndex = -1 }) {
      super({
        id: "dropdown-menu",
        context,
        layoutStrategy: layoutRegistry["anchored"](),  // use popup layout for dropdown menu
        renderStrategy: dropdownMenuRenderStrategy,      // custom renderer for dropdown menu
        children: []
      });
      this.context = context;
  this.anchor = anchor; // reference to dropdown input node
      this.options = options;
      this.onSelect = onSelect;
        this.selectedIndex = selectedIndex;

        this.rebuildChildren();
    }
    rebuildChildren() {
        // clear old children
        this.children = [];
    
        this.options.forEach((option, i) => {
          const label = new LabelNode({
            id: `dropdown-option-${i}`,
            context: this.context,
            text: option.label,
            onSelect: () => this.selectOption(i),
            style: {
              font: "14px sans-serif",
              paddingY: 6,
              paddingX: 8,
              backgroundColor: "#eee"
            },
            hitTestStrategy: rectHitTestStrategy
          });
    
          this.add(label);
        });
        console.log("menu children:", this.children.length);
console.log("menu bounds:", this.bounds);

    
        this.invalidate();
      }
    
      selectOption(index) {
        const chosen = this.options[index];
        if (!chosen) return;
    
        this.anchor.value = chosen.value;
        this.onSelect?.(chosen, index);
    
        this.anchor.dropdownVisible = false;
        this.invalidate();
      }
    
      updateOptions(newOptions) {
        this.options = newOptions;
        this.selectedIndex = newOptions.length ? 0 : -1;
        this.rebuildChildren();
      }
    
      setSelectedIndex(i) {
        this.selectedIndex = i;
        this.invalidate();
      }
  }
  