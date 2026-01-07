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
    if (!node.contains(point.x, point.y)) return null;

  if(node.hitTest(point, ctx)) {
    console.log('hit test success', node);
  }
    return node.hitTest(point, ctx) ? node : null;
  }
}