import { ContainerNode } from "./containerNode.js";
import { toastRenderStrategy } from "../../renderers/nodeRenderers/toastRenderer.js";


export class ToastNode extends ContainerNode {
  constructor({
    id = "toastLayer",
    layout = "toast",
    spacing = 10,
    marginBottom = 40
  } = {}) {
    super({
      id,
      layout,
      renderStrategy: toastRenderStrategy,
      children: []
    });

    this.visible = false;
    this.hitTestable = false;

    this.spacing = spacing;
    this.marginBottom = marginBottom;

    this.messageTimeoutId = null;
  }

  showMessage(messageNode, { timeoutMs = 3000, replace = true } = {}) {
    if (!messageNode) return;

    if (replace) {
      this.children = [];
    }

    this.add(messageNode);
    this.visible = true;
    this.invalidate();

    if (this.messageTimeoutId) clearTimeout(this.messageTimeoutId);

    if (timeoutMs > 0) {
      this.messageTimeoutId = setTimeout(() => {
        this.children = [];
        this.visible = false;
        this.invalidate();
      }, timeoutMs);
    }
  }
}
