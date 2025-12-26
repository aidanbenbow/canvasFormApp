import { textRenderer } from "../../renderers/nodeRenderers/textRenderer.js";
import { textLayoutStrategy } from "../../strategies/nodeLayouts/textLayout.js";
import { SceneNode } from "./sceneNode.js";

export class TextNode extends SceneNode {
    constructor({ id, text, style = {} }) {
      super({
        id,
        layoutStrategy: textLayoutStrategy,
        renderStrategy: textRenderer
      });
  
      this.text = text;
  
      this.style = {
        font: "14px sans-serif",
        color: "#000",
        ...style
      };
    }
  }
  