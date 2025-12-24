export const buttonIntrinsicMeasure = {
    measure(node, constraints, ctx) {
      const label = node.widget?.label ?? '';
      const padding = 12;
  
      let textWidth = 80; // fallback
      if (ctx && label) {
        ctx.save();
        ctx.font = node.style.font || '12px sans-serif';
        textWidth = ctx.measureText(label).width;
        ctx.restore();
      }
  
      const width = Math.min(textWidth + padding * 2, constraints.maxWidth);
      const height = Math.min(30, constraints.maxHeight ?? 30);

  
      return { width, height };
    }
  };

  export const buttonLayoutStrategy = {
    measure: (node, constraints, ctx) => buttonIntrinsicMeasure.measure(node, constraints, ctx),
    layout: (node, bounds) => { node.bounds = bounds; }
  };