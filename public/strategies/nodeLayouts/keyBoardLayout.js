export const keyboardLayoutStrategy = {
    measure(node, constraints, ctx) {
      const maxWidth = constraints.maxWidth;
      const spacing = 8;
      const rowCount = node.keyLayout.length;
  
      // Key width = evenly divide screen width
      const keyWidth = (maxWidth - (10 * spacing)) / 10;
  
      // Key height = fixed or proportional
      const keyHeight = 48;
  
      // Measure children
      for (const child of node.children) {
        child.measure({ maxWidth: keyWidth, maxHeight: keyHeight }, ctx);
      }
  
      const height = rowCount * keyHeight + (rowCount - 1) * spacing;
  
      return { width: maxWidth, height };
    },
  
    layout(node, bounds, ctx) {
      node.bounds = bounds;
  
      const spacing = 8;
      const keyWidth = (bounds.width - (10 * spacing)) / 10;
      const keyHeight = 48;
  
      let y = bounds.y;
  
      node.keyLayout.forEach((row) => {
        let x = bounds.x;
  
        row.forEach((key) => {
          const child = node.children.find(c => c.label === key);
          if (!child) return;
  
          child.layout({
            x,
            y,
            width: keyWidth,
            height: keyHeight
          }, ctx);
  
          x += keyWidth + spacing;
        });
  
        y += keyHeight + spacing;
      });
    }
  };