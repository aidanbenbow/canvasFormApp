export class LayoutStrategy {
  measure(node, constraints, ctx) {
    throw new Error(`${this.constructor.name}.measure() not implemented`);
  }

  layout(node, bounds, ctx) {
    throw new Error(`${this.constructor.name}.layout() not implemented`);
  }
}