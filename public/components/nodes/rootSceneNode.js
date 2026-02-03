import { SceneNode } from "./sceneNode.js";

export class RootSceneNode extends SceneNode {
  constructor({ id,context, style, layoutStrategy, renderStrategy }) {
    super({ id,context, style, layoutStrategy, renderStrategy });
    
    this.overlayLayer = null; // dedicated overlay / system UI
  }

  setOverlayLayer(node) {
    // Remove if already in children
    const existingIndex = this.children.indexOf(node);
    if (existingIndex >= 0) this.children.splice(existingIndex, 1);

    this.overlayLayer = node;
    // Always push overlay layer to the end
    this.children.push(node);
  }

  add(child) {
    // Add normally
    super.add(child);

    // Ensure overlay layer stays on top
    if (this.overlayLayer) {
      const index = this.children.indexOf(this.overlayLayer);
      if (index !== this.children.length - 1) {
        this.children.splice(index, 1); // remove from old position
        this.children.push(this.overlayLayer); // put on top
      }
    }
  }
}
