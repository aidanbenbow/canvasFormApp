export class AnchoredOverlayLayoutStrategy {
    constructor({ anchor, optionHeight = 24, maxHeight = 200 } = {}) {
      this.anchor = anchor;           // the input node to anchor to
      this.optionHeight = optionHeight;
      this.maxHeight = maxHeight;
    }
  
    measure(node, constraints, ctx) {
        const optionHeight = node.anchor?.style?.optionHeight ?? node.optionHeight ?? this.optionHeight;
        const maxHeight = node.anchor?.style?.menuMaxHeight ?? node.maxHeight ?? this.maxHeight;
        const width = constraints.maxWidth;
        const height = Math.min((node.options?.length || 0) * optionHeight, maxHeight);
  
      node._measured = { width, height };
      return { width, height };
    }
  
    layout(node, bounds, ctx) {
        const anchor = node.anchor;
        const optionHeight = node.anchor?.style?.optionHeight ?? node.optionHeight ?? this.optionHeight;
        const maxHeight = node.anchor?.style?.menuMaxHeight ?? node.maxHeight ?? this.maxHeight;
        const contentHeight = (node.options?.length || 0) * optionHeight;
        const menuHeight = Math.min(contentHeight, maxHeight);
      
        if (!anchor) {
          node.bounds = { ...bounds, height: menuHeight };
        } else {
          const scrollOffsetY = getScrollOffsetY(anchor);
          const ab = anchor.bounds;
          node.bounds = {
            x: ab.x,
            y: ab.y - scrollOffsetY + ab.height,
            width: ab.width,
            height: menuHeight
          };
        }

        if (node.scroll) {
          node.scroll.setContentHeight(contentHeight);
          node.scroll.setViewportHeight(menuHeight);
        }
      
        // layout children as vertical stack
        const scrollOffset = node.scroll?.offsetY ?? 0;
        node.children.forEach((child, i) => {
          child.layout({
            x: node.bounds.x,
            y: node.bounds.y + i * optionHeight - scrollOffset,
            width: node.bounds.width,
            height: optionHeight
          }, ctx);
        });
      }
      
  }

function getScrollOffsetY(node) {
  let offset = 0;
  let current = node.parent;
  while (current) {
    if (current.scroll?.offsetY) {
      offset += current.scroll.offsetY;
    }
    current = current.parent;
  }
  return offset;
}
  