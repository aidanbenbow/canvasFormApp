export class SceneEvent {
    constructor({ type, x, y, target, originalEvent }) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.target = target;
      this.originalEvent = originalEvent;
  
      this.currentTarget = null;
      this.phase = null; // 'capture' | 'target' | 'bubble'
      this.propagationStopped = false;
    }
  
    stopPropagation() {
      this.propagationStopped = true;
    }
  }

  export function buildScenePath(target) {
    const path = [];
    let node = target;
    while (node) {
      path.unshift(node);
      node = node.parent;
    }
    return path;
  }
  