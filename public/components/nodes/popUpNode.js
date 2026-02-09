import { popupRenderStrategy } from "../../renderers/nodeRenderers/popupRenderer.js";
import { ContainerNode } from "./containerNode.js";

export class PopUpNode extends ContainerNode {
  constructor({
    id = "popup",
    layout = "popup",
    backgroundColor = null,
    spacing = 10
  }) {
    super({
      id,
      layout,
      style: { backgroundColor },
      renderStrategy: popupRenderStrategy,
      children: []
    });

    this.visible = false;
    this.spacing = spacing;
    this.persistentChildren = new Set();
    this.messageTimeoutId = null;
  }

  addPersistent(child) {
    if (!child) return;
    this.persistentChildren.add(child);
    this.add(child);
  }

  addTransient(child) {
    if (!child) return;
    this.add(child);
    console.log(this.children)
  }

  clearTransient() {
    this.children = this.children.filter((child) => this.persistentChildren.has(child));
    this.invalidate();
  }
  hasTransient() {
    return this.children.some((child) => !this.persistentChildren.has(child));
  }

  showMessage(messageNode, { timeoutMs = 3000, replace = true } = {}) {
    if (!messageNode) return;

    if (replace) {
      this.clearTransient();
    }

    this.addTransient(messageNode);
    this.show();
console.log(messageNode)
    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
    }

    if (timeoutMs > 0) {
      this.messageTimeoutId = setTimeout(() => {
        this.clearTransient();
        this.hide();
      }, timeoutMs);
    }
  }

  show() {
    this.visible = true;
    this.hitTestable = false;
    this.invalidate();
  }

  hide() {
    this.visible = false;
    this.invalidate();
  }

  toggle() {
    this.visible = !this.visible;
    this.invalidate();
  }

  clear({ includePersistent = false } = {}) {
    if (includePersistent) {
      this.children = [];
      this.persistentChildren.clear();
    } else {
      this.clearTransient();
    }
    this.invalidate();
  }
}
