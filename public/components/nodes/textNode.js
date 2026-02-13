import { layoutRegistry } from "../../registries/layoutRegistry.js";
import { textRenderer } from "../../renderers/nodeRenderers/textRenderer.js";
import { TextLayoutStrategy } from "../../strategies/nodeLayouts/textLayout.js";
import { SceneNode } from "./sceneNode.js";

export class TextNode extends SceneNode {
    constructor({ id, text, runs = null, style = {} }) {
      super({
        id,
        layoutStrategy: layoutRegistry["text"]() || new TextLayoutStrategy(),
        renderStrategy: textRenderer
      });
  
      this.text = text;
      this.runs = runs;
  
      const responsiveStyle = isSmallScreen()
        ? {
            font: "46px sans-serif"
          }
        : {};

      this.style = {
        font: "38px sans-serif",
        color: "#CF3113",
        ...responsiveStyle,
        ...style
      };
    }
  }

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
  