export class LayoutEngine {
    compute(root, constraints) {
      const layoutState = {
        bounds: new Map(),
        visible: new Set()
      };
  
      this.layoutNode(root, constraints, layoutState);
      return layoutState;
    }
  
    layoutNode(node, constraints, state) {
      const size = node.measure(constraints);
  
      const bounds = {
        x: constraints.x,
        y: constraints.y,
        width: size.width,
        height: size.height
      };
  
      state.bounds.set(node.id, bounds);
      state.visible.add(node.id);
  
      node.layoutChildren(bounds, state);
    }
  }