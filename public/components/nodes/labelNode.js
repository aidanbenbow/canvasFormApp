import { labelRenderer } from "../../renderers/nodeRenderers/labelRenderer.js";
import { rectHitTestStrategy } from "../../strategies/rectHitTest.js";
import { SceneNode } from "./sceneNode.js";

export class LabelNode extends SceneNode {
  constructor({ id,context, text, selected = false, onSelect, style = {} }) {
    super({
      id,
      context,
      layoutStrategy: null,        // parent container handles layout
      renderStrategy: labelRenderer,        // we’ll attach a renderer
      hitTestStrategy: rectHitTestStrategy        // simple rect hit test
    });

    this.text = text;
    this.onSelect = onSelect;

    this.style = {
      font: "34px sans-serif",
      paddingX: 8,
      paddingY: 4,
      backgroundColor: selected ? "#0078ff" : "transparent",
      ...style
    };
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
   
    this.invalidate();
  }

  onPointerUp() {
    this.setUIState({ pressed: false });
    this.onSelect?.();
    this.invalidate();
  }
}