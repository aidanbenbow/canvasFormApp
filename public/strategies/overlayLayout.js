export function overlayLayoutStrategy() {
    return {
      measure(node, available) {
        return available;
      },
      layout(node, bounds) {
        node.children.forEach(child => {
          child.setLayoutBounds(bounds);
        });
      }
    };
  }