export const PositionManager = {
    toCanvas(pos) {
      const { width, height } = getCanvasSize();
      return scaleToCanvas(pos, width, height);
    },
    fromCanvas(pos) {
      const { width, height } = getCanvasSize();
      return scaleFromCanvas(pos, width, height);
    }
  };
  