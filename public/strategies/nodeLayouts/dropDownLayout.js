export class DropdownLayoutStrategy {
    measure(node, constraints, ctx) {
      const width = node.style.width ?? Math.min(300, constraints.maxWidth);
      const height = node.style.height ?? (parseInt(node.style.font) + node.style.paddingY * 2);
  
      // no multi-line wrapping needed
      node._layout = {
        lines: [node.value || node.placeholder],
        lineHeight: parseInt(node.style.font) + 2
      };
  
      return {
        width: Math.min(width, constraints.maxWidth),
        height: Math.min(height, constraints.maxHeight)
      };
    }
  
    layout(node, bounds) {
      node.bounds = bounds;
    }
  }
  