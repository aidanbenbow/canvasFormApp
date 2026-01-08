// export const rectHitTestStrategy = {
//     hitTest(node, point) {
//       const { x, y } = point;
//     const { x: nx, y: ny, width, height } = node.bounds;
// //console.log('rectHitTestStrategy', { x, y, nx, ny, width, height });
//       return (
//         x >= nx &&
//         y >= ny &&
//         x <= nx + width &&
//         y <= ny + height
//       );
//     }
//   };

  export const rectHitTestStrategy = {
    hitTest(node, point) {
      const { x, y } = point;
      const { width, height } = node.bounds;
  
      return (
        x >= 0 &&
        y >= 0 &&
        x <= width &&
        y <= height
      );
    }
  };
  