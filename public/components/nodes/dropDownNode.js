import { SceneNode } from "./sceneNode.js";
import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { dropdownInputRenderer } from "../../renderers/nodeRenderers/dropDownRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { DropdownMenuNode } from "./dopDownMenuNode.js";
import { InputNode } from "./inputNode.js";
import { ACTIONS } from "../../events/actions.js";

export class DropdownInputNode extends InputNode {
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
    this.filteredOptions = [...this.options];
    this.menuNode = null; // reference to dropdown menu instance

    this.selectedIndex = -1;
    this.onSelect = onSelect; // callback when selecting an option
this.dropdownVisible = false;
    // default styling
    this.style = {
      font: "24px sans-serif",
      paddingX: 8,
      paddingY: 6,
      minHeight: 32,
      borderColor: "#ccc",
      focusBorderColor: "#0078ff",
      width: 350,
      optionHeight: 24,   // height of each option in dropdown
      ...style
    };

  }
  getValue() {
    return this.value || "";
  }
  updateText(text, { openDropdown = true } = {}) {
    this.value = text;

    // open dropdown automatically while typing
    if (openDropdown && !this.dropdownVisible) {
      this.openDropdown();
    }

    this.filterOptions();
    this.invalidate();
  }

  clear() {
    this.closeDropdown();
    this.value = "";
    this.filteredOptions = [...this.options];
    this.selectedIndex = -1;
    this.invalidate();
  }


  // Click toggles dropdown
  onPointerDown(pointerX, pointerY) {
    this.context.focusManager.focus(this);
    
    if (this.dropdownVisible) {
      this.closeDropdown();
    } else {
      this.openDropdown();
      this.filterOptions();
    }
    this.selectedIndex = -1; // reset selection
  
    this.invalidate();
  }
  // Keyboard navigation
  onKeyDown(key) {
    if (!this.dropdownVisible) return false;

    const opts = this.filteredOptions;

    if (key === "ArrowDown") {
      if (!opts.length) return true;
      this.selectedIndex = (this.selectedIndex + 1) % opts.length;
      this.syncMenuHighlight();
      this.invalidate();
      return true;
    }

    if (key === "ArrowUp") {
      if (!opts.length) return true;
      this.selectedIndex = (this.selectedIndex - 1 + opts.length) % opts.length;
      this.syncMenuHighlight();
      this.invalidate();
      return true;
    }

    if (key === "Enter") {
      if (this.selectedIndex >= 0 && this.selectedIndex < opts.length) {
        this.selectOption(this.selectedIndex);
      }
      return true;
    }

    if (key === "Escape") {
      this.closeDropdown();
      return true;
    }

    return false;
  }
  selectOption(index) {
    const opt = this.filteredOptions[index];
    if (!opt) return;

    this.value = opt.value;

    this.emit("select", {
      value: opt.value,
      option: opt,
      index,
      source: this
    });

    this.onSelect?.(opt, index);

    this.closeDropdown();
    this.invalidate();
  }

  filterOptions() {
    const q = (this.value || "").trim().toLowerCase();

    if (!q) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter((opt) => {
        const label = (opt.label ?? "").toLowerCase();
        const value = (opt.value ?? "").toLowerCase();
        return label.includes(q) || value.includes(q);
      });
    }

    // reset selection to top
    this.selectedIndex = this.filteredOptions.length ? 0 : -1;

     // Update menu correctly
  if (this.dropdownVisible && this.menuNode) {
    this.menuNode.updateOptions(this.filteredOptions);
    this.menuNode.setSelectedIndex(this.selectedIndex);
  }
  }
  syncMenuHighlight() {
    if (!this.dropdownVisible) return;

    const { popupLayer } = this.context.uiServices;
    const menu = popupLayer.children?.[0];
    menu?.setSelectedIndex?.(this.selectedIndex);
    popupLayer.invalidate?.();
  }
  openDropdown() {
    
    const menu = new DropdownMenuNode({
      anchor: this,
      context: this.context,
      options: this.filteredOptions,
      onSelect: (option, index) => {
        this.value = option.value;
        this.selectedIndex = index;
        this.emit("select", {value:option.value,option, index, source: this});
        this.closeDropdown();
      }
    });
 
  this.menuNode = menu; // keep reference to menu instance
 // Dispatch show event
 this.context.dispatcher.dispatch(ACTIONS.DROPDOWN.SHOW, menu);
 this.dropdownVisible = true;
  }

    closeDropdown() {
      this.dropdownVisible = false;
      this.menuNode = null;
      this.context.dispatcher.dispatch(ACTIONS.DROPDOWN.HIDE);
    }
  
  
}

