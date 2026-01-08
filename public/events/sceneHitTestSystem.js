export class SceneHitTestSystem {

  hitTest(root, x, y, ctx) {
    return this._hitNode(root, { x, y }, ctx);
  }

  _hitNode(node, point, ctx) {
    if (!node.visible) return null;
    // Convert global → local for THIS node
    const local = node.globalToLocal(point);

    // 1. Test children first — pass GLOBAL point down
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = this._hitNode(node.children[i], point, ctx);
      if (hit) return hit;
    }
    // 2. Then test this node
    if (!node.contains(local.x, local.y)) return null;
    return node.hitTest(local, ctx) ? node : null;
  }
}