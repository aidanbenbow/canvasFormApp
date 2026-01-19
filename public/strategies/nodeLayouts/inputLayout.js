export const inputLayoutStrategy = {
  measure(node, constraints, ctx) {
    const width =
      node.style.width ??
      Math.min(200, constraints.maxWidth);   // default width

    const height =
      node.style.height ??
      Math.min(32, constraints.maxHeight);   // default height

    return { width, height };
  },

  layout(node, bounds) {
    node.bounds = bounds;
  }
};


// export const inputLayoutStrategy = {
//     measure(node, constraints, ctx) {
//       ctx.save();
//       ctx.font = node.style.font;
  
//       const text = node.value || node.placeholder;

//       const textWidth = ctx.measureText(text).width;
//       const textHeight =
//         ctx.measureText(text).actualBoundingBoxAscent +
//         ctx.measureText(text).actualBoundingBoxDescent;
  
//       ctx.restore();
  
//       const width = Math.min(textWidth + node.style.paddingX * 2, constraints.maxWidth);
//       const height = Math.min(textHeight + node.style.paddingY * 2, constraints.maxHeight);
  
//       return { width, height };
//     },
  
//     layout(node, bounds) {
//       node.bounds = bounds;
//     }
//   };