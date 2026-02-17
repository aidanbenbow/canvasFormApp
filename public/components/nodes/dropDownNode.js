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
    this.selectedValue = null;
    this.onSelect = onSelect; // callback when selecting an option
this.dropdownVisible = false;
    // default styling
    const baseStyle = {
      font: "24px 'Segoe UI', Tahoma, sans-serif",
      paddingX: 8,
      paddingY: 6,
      minHeight: 32,
      borderColor: "#ccc",
      focusBorderColor: "#0078ff",
      textColor: "#1f2937",
      placeholderColor: "#9ca3af",
      width: 350,
      fillWidth: true,
      optionHeight: 36
    };

    const responsiveStyle = isSmallScreen()
      ? {
          font: "36px 'Segoe UI', Tahoma, sans-serif",
          paddingX: 20,
          paddingY: 18,
          minHeight: 72,
          width: Math.min(820, Math.floor(window.innerWidth * 0.96)),
          optionHeight: 64
        }
      : {};

    this.style = {
      ...baseStyle,
      ...responsiveStyle,
      ...style
    };

  }
  getValue() {
    return this.selectedValue ?? (this.value || "");
  }

  getDisplayValue() {
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
    const wasFocused = this.uiState?.focused || false;
    this.context.focusManager.focus(this);
    const editor = this.context?.textEditorController;
    const ctx = this.context?.ctx;

    if (!wasFocused) {
      this.openDropdown();
      this.filterOptions();
      this.selectedIndex = -1; // reset selection
    }

    if (editor?.beginPointerSelection) {
      editor.beginPointerSelection(this, pointerX, pointerY, ctx);
    } else if (editor?.caretController) {
      editor.caretController.moveCaretToMousePosition(pointerX, pointerY, ctx);
    }

    this.invalidate();
  }
  // Keyboard navigation
  onKeyDown(key) {
    if (!this.dropdownVisible) return false;

    const opts = this.filteredOptions;

    if (key === "ArrowDown") {
      if (!opts.length) return true;
      if (this.selectedIndex < 0) {
        this.selectedIndex = 0;
      } else {
        this.selectedIndex = (this.selectedIndex + 1) % opts.length;
      }
      this.syncMenuHighlight();
      this.invalidate();
      return true;
    }

    if (key === "ArrowUp") {
      if (!opts.length) return true;
      if (this.selectedIndex < 0) {
        this.selectedIndex = opts.length - 1;
      } else {
        this.selectedIndex = (this.selectedIndex - 1 + opts.length) % opts.length;
      }
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

    this.value = opt.label ?? opt.value;
    this.selectedValue = opt.value;

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

    // don't auto-select; wait for explicit user selection
    this.selectedIndex = -1;

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
        this.value = option.label ?? option.value;
        this.selectedValue = option.value;
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

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}

