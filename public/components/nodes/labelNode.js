import { labelRenderer } from "../../renderers/nodeRenderers/labelRenderer.js";
import { SceneNode } from "./sceneNode.js";

export class LabelNode extends SceneNode {
  constructor({ id, text, selected = false, onSelect, style = {} }) {
    super({
      id,
      layoutStrategy: null,        // parent container handles layout
      renderStrategy: labelRenderer,        // we’ll attach a renderer
      hitTestStrategy: null        // simple rect hit test
    });

    this.text = text;
    this.onSelect = onSelect;

    this.state = {
      hovered: false,
      selected
    };

    this.style = {
      font: "16px sans-serif",
      paddingX: 8,
      paddingY: 4,
      ...style
    };
  }

  onPointerEnter() {
    this.state.hovered = true;
    this.invalidate();
  }

  onPointerLeave() {
    this.state.hovered = false;
    this.invalidate();
  }

  onPointerUp() {
    this.onSelect?.();
  }
}