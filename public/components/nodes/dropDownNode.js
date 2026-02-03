import { SceneNode } from "./sceneNode.js";
import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownInputRenderer } from "../../renderers/nodeRenderers/dropDownRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { DropdownMenuNode } from "./dopDownMenuNode.js";

export class DropdownInputNode extends SceneNode {
  constructor({ id, context, value = "", placeholder = "", options = [], onSelect, style = {} }) {
    super({
      id,
      context,
      layoutStrategy: layoutRegistry["dropDown"](),   // custom dropdown layout
      renderStrategy: dropdownInputRenderer,         // custom dropdown renderer
      hitTestStrategy: rectHitTestStrategy
    });
this.context = context;
    this.value = value;
    this.placeholder = placeholder;
    this.options = options;

    this.selectedIndex = -1;
    this.onSelect = onSelect; // callback when selecting an option
this.dropdownVisible = false;
    // default styling
    this.style = {
      font: "14px sans-serif",
      paddingX: 8,
      paddingY: 6,
      minHeight: 32,
      borderColor: "#ccc",
      focusBorderColor: "#0078ff",
      optionHeight: 24,   // height of each option in dropdown
      ...style
    };

  }

  // Click toggles dropdown
  onPointerDown(pointerX, pointerY) {
    this.context.focusManager.focus(this.id);
    
    if (this.dropdownVisible) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
    this.selectedIndex = -1; // reset selection
  
    this.invalidate();
  }
  // Keyboard navigation
  onKeyDown(key) {
    if (!this.dropdownVisible) return false;

    if (key === "ArrowDown") {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
      this.invalidate();
      return true;
    } else if (key === "ArrowUp") {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.options.length) % this.options.length;
      this.invalidate();
      return true;
    } else if (key === "Enter") {
      if (this.selectedIndex >= 0) this.selectOption(this.selectedIndex);
      return true;
    } else if (key === "Escape") {
      this.dropdownVisible = false;
      this.invalidate();
      return true;
    }

    return false;
  }
  openDropdown() {
    const { popupLayer } = this.context.uiServices;
    console.log(popupLayer);
  
    const menu = new DropdownMenuNode({
      anchor: this,
      context: this.context,
      options: this.options,
      onSelect: (option, index) => {
        this.value = option.value;
        this.selectedIndex = index;
        this.emit("select", {value:option.value,option, index, source: this});
        this.closeDropdown();
      }
    });
  this.dropdownVisible = true;
 
  
    popupLayer.children = [menu];
    popupLayer.show();
    popupLayer.invalidate?.();
  }
  closeDropdown() {
    const { popupLayer } = this.context.uiServices;
    this.dropdownVisible = false;
    popupLayer.clear();
    popupLayer.hide();
    popupLayer.invalidate?.();
  }
  
}

