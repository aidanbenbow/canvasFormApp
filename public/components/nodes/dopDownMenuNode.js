import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownMenuRenderStrategy } from "../../renderers/nodeRenderers/dropDownMenuRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { ContainerNode } from "./containerNode.js";
import { LabelNode } from "./labelNode.js";
import { ScrollController } from "../../controllers/scrollControllrt.js";

export class DropdownMenuNode extends ContainerNode {
    constructor({anchor,context, options, onSelect, selectedIndex = -1 }) {
      super({
        id: "dropdown-menu",
        context,
        layoutStrategy: layoutRegistry["anchored"](),  // use popup layout for dropdown menu
        renderStrategy: dropdownMenuRenderStrategy,      // custom renderer for dropdown menu
        children: []
      });
        this.style = {
          backgroundColor: "#ffffff",
          borderColor: "#cbd5e1",
          clipChildren: true
        };
      this.context = context;
  this.anchor = anchor; // reference to dropdown input node
      this.options = options;
      this.onSelect = onSelect;
        this.selectedIndex = selectedIndex;

        this.scroll = new ScrollController({ contentHeight: 0, viewportHeight: 0 });
        this.maxHeight = anchor?.style?.menuMaxHeight ?? 240;

        this.rebuildChildren();
    }
    rebuildChildren() {
        // clear old children
        this.children = [];

        const baseFontSize = parseInt(this.anchor?.style?.font || "16px", 10) || 16;
        const fontSize = isSmallScreen() ? Math.max(20, Math.round(baseFontSize * 1.0)) : Math.max(16, Math.round(baseFontSize * 0.9));
        const font = `${fontSize}px 'Segoe UI', Tahoma, sans-serif`;
        const paddingY = isSmallScreen() ? 10 : 8;
        const paddingX = isSmallScreen() ? 12 : 10;
    
        this.options.forEach((option, i) => {
          const label = new LabelNode({
            id: `dropdown-option-${i}`,
            context: this.context,
            text: option.label,
            onSelect: () => this.selectOption(i),
            style: {
              font,
              paddingY,
              paddingX,
              textColor: "#111",
              backgroundColor: "transparent"
            },
            hitTestStrategy: rectHitTestStrategy
          });
    
          this.add(label);
        });


    
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

      onEvent(event) {
        if (event.type === "wheel" && this.scroll) {
          this.scroll.scrollBy(event.originalEvent.deltaY);
          this.invalidate();
          return true;
        }
        return false;
      }
  }

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
  