export class HitTestManager {
  constructor(root) {
    this.root = root;
  }

  hitTest(x, y) {
    return this._hitNode(this.root, x, y);
  }

  _hitNode(node, x, y) {
    if (!node.visible || !node.bounds) return null;

    // Descend children first (topmost last)
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const hit = this._hitNode(child, x, y);
      if (hit) return hit;
    }

    // Use the node's hitTestStrategy
    if (node.hitTestStrategy?.hitTest(node, x, y)) {
      return node;
    }

    return null;
  }
}