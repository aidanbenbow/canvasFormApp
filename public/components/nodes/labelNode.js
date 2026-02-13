import { labelRenderer } from "../../renderers/nodeRenderers/labelRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";
import { wrapTextByWords } from "../../controllers/textModel.js";

export class LabelNode extends SceneNode {
  constructor({ id,context, text, selected = false, editable = false, onSelect, onChange, style = {} }) {
    super({
      id,
      context,
      layoutStrategy: null,        // parent container handles layout
      renderStrategy: labelRenderer,        // we’ll attach a renderer
      hitTestStrategy: rectHitTestStrategy        // simple rect hit test
    });

    this.text = text;
    this.onSelect = onSelect;
    this.editable = editable;
    this.onChange = onChange;

    const responsiveStyle = isSmallScreen()
      ? {
          font: "42px sans-serif",
          paddingX: 12,
          paddingY: 6
        }
      : {};

    this.style = {
      font: "34px sans-serif",
      paddingX: 8,
      paddingY: 4,
      backgroundColor: selected ? "#0078ff" : "transparent",
      ...responsiveStyle,
      ...style
    };

    if (selected) {
      this.setUIState({ selected: true });
    }
  }

  onPointerEnter() {
    this.setUIState({ hovered: true });
    this.invalidate();
  }

  onPointerLeave() {
    this.setUIState({ hovered: false });
    this.invalidate();
  }

  onPointerDown() {
    this.setUIState({ pressed: true });
    if (this.editable) {
      this.context.focusManager?.focus(this);
      const ctx = this.context.ctx;
      const editor = this.context.textEditorController;
      if (editor && editor.activeNode !== this) {
        editor.startEditing(this);
      }
      editor?.beginPointerSelection?.(this, this.bounds.x + this.style.paddingX, this.bounds.y + this.style.paddingY, ctx);
    }
    this.invalidate();
  }

  onPointerUp() {
    this.setUIState({ pressed: false });
    this.onSelect?.();
    if (this.editable) {
      const editor = this.context.textEditorController;
      editor?.endPointerSelection?.({ x: this.bounds.x + this.style.paddingX, y: this.bounds.y + this.style.paddingY });
    }
    this.invalidate();
  }

  onPointerDoubleClick(pointerX, pointerY) {
    if (!this.editable) return;
    this.context.focusManager?.focus(this);
    const ctx = this.context.ctx;
    this.context.textEditorController?.caretController?.selectWordAtMousePosition(pointerX, pointerY, ctx);
  }

  onEvent(event) {
    if (!this.editable) return false;
    if (event.type === "mousemove") {
      const editor = this.context.textEditorController;
      if (editor?.selectionDragActive && editor.activeNode === this) {
        editor.updatePointerSelection(event.x, event.y, this.context.ctx);
        return true;
      }
    }
    return false;
  }

  updateText(newValue) {
    this.text = newValue;
    this.onChange?.(newValue);
    this.invalidate();
  }

  getValue() {
    return this.text ?? "";
  }

  measure(constraints, ctx) {
    if (!ctx) return { width: this.style.width ?? 100, height: this.style.height ?? 30 };
    ctx.save();
    ctx.font = this.style.font;

    const maxWidth = this.style.maxWidth ?? constraints.maxWidth;
    const textWidth = Math.max(0, maxWidth - (this.style.paddingX || 0) * 2);
    const lines = wrapTextByWords(ctx, this.text || "", textWidth);
    if (lines.length === 0) {
      lines.push({ text: "", startIndex: 0, endIndex: 0 });
    }
    const lineHeight = Math.max(1, parseInt(this.style.font, 10) * 1.2);
    this._layout = { lines, lineHeight };

    const height = lines.length * lineHeight + (this.style.paddingY || 0) * 2;
    ctx.restore();
    this.measured = { width: maxWidth, height };
    return this.measured;
  }
}

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}