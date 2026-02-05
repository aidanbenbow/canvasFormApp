import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { textRenderer } from "../../renderers/nodeRenderers/textRenderer.js";
import { TextLayoutStrategy } from "../../strategies/nodeLayouts/textLayout.js";
import { SceneNode } from "./sceneNode.js";

export class TextNode extends SceneNode {
    constructor({ id, text, style = {} }) {
      super({
        id,
        layoutStrategy: layoutRegistry["text"]() || new TextLayoutStrategy(),
        renderStrategy: textRenderer
      });
  
      this.text = text;
  
      this.style = {
        font: "38px sans-serif",
        color: "#CF3113",
        ...style
      };
    }
  }
  