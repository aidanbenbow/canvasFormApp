
export class HitTestManager {
    constructor(root) {
      this.root = root;
    }
   hitTest(x,y){
return this._hitNode(this.root,x,y);
   }
   _hitNode(node,x,y){
    if(!node.visible) return null;
    for(const child of [...node.children].reverse()){
      const hit = this._hitNode(child,x,y);
      if(hit) return hit;
    }
    if(node.interactive && node.hitTestPoint(x,y)){
      return node;
    }
       return null;
   }
  }