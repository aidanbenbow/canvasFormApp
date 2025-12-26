import { VerticalLayoutStrategy } from "../vertical.js";

export function scrollLayoutStrategy(layout = "vertical") {
  const innerLayout =
    layout === "vertical"
      ? new VerticalLayoutStrategy()
      : null

  return {
    measure(node, constraints, ctx) {
      // Measure children using inner layout
      return innerLayout.measure(node, constraints, ctx);
    },

    layout(node, bounds, ctx) {
      node.bounds = bounds;

      // Layout children inside scrollable area
      innerLayout.layout(node, {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: Infinity // allow overflow
      }, ctx);
    }
  };
}