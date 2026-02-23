export class SceneHitTestSystem {

  hitTest(root, x, y, ctx) {
    // Use the root passed in, not this.root
    if (!root || !root.bounds) {
      return null;
    }

  
    return this._hitNode(root, { x, y }, ctx);
  }

  _hitNode(node, point, ctx) {
    if (!node || !node.visible || !node.bounds) return null;

// Convert global → local
const local = node.globalToLocal(point);

    // If pointer is outside this node, none of its children should be hittable.
    if (!node.contains(local.x, local.y)) return null;

    const childPoint = node.scroll
      ? { x: point.x, y: point.y + (node.scroll.offsetY || 0) }
      : point;

    // 1. Test children first — pass GLOBAL point down
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = this._hitNode(node.children[i], childPoint, ctx);
      if (hit) return hit;
    }
    // 2. Then test this node
    return node.hitTest(local, ctx) ? node : null;
  }
}