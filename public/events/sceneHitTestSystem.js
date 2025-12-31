export class SceneHitTestSystem {

  hitTest(root,x, y, ctx) {
    return this._hitNode(root, { x, y }, ctx);
  }

  _hitNode(node, point, ctx) {
    if (!node.visible) return null;
    if (!node.contains(point.x, point.y)) return null;
    console.log("Testing node:", node.id, "point:", point);
    // Traverse children in reverse draw order
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = this._hitNode(node.children[i], point, ctx);
      if (hit) return hit;
    }

    return node.hitTest(point, ctx) ? node : null;
  }
}
