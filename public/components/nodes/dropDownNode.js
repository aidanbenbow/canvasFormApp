import { SceneNode } from "./sceneNode.js";
import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownInputRenderer } from "../../renderers/nodeRenderers/dropDownRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { DropdownMenuNode } from "./dopDownMenuNode.js";

export class DropdownInputNode extends SceneNode {
  constructor({ id, context, value = "", placeholder = "", options = [], onSelect, style = {} }) {
    super({
      id,
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

    this.state = {
      focused: false
    };
  }

  // Click toggles dropdown
  onPointerDown(pointerX, pointerY) {
    this.state.focused = true;
    this.openDropdown();
    this.selectedIndex = -1; // reset selection
    this.emit("focus", this);
    this.invalidate();
  }

  // Pointer move highlights option
  onPointerMove(pointerX, pointerY) {
    if (!this.dropdownVisible) return;

    const relativeY = pointerY - (this.bounds.y + this.bounds.height);
    const index = Math.floor(relativeY / this.style.optionHeight);

    if (index >= 0 && index < this.options.length) {
      this.selectedIndex = index;
      this.invalidate();
    } else {
      this.selectedIndex = -1;
      this.invalidate();
    }
  }

  // Click an option to select
  onPointerUp(pointerX, pointerY) {
    if (!this.dropdownVisible) return;
    if (this.selectedIndex >= 0) {
      this.selectOption(this.selectedIndex);
    }
  }

  selectOption(index) {
    const chosen = this.options[index];
    if (!chosen) return;

    this.value = chosen;
    this.dropdownVisible = false;
    this.selectedIndex = index;
    this.invalidate();

    if (this.onSelect) this.onSelect(chosen);
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
      options: this.options,
      onSelect: (value, index) => {
        this.value = value;
        this.selectedIndex = index;
        popupLayer.clear();
        popupLayer.hide();
      }
    });
  console.log(menu);
  
    popupLayer.children = [menu];
    popupLayer.show();
  }
  
}
