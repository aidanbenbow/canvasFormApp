import { UIElement } from "./UiElement.js";

export class UIFieldContainer extends UIElement {
  constructor({
    id,
    context,
    layoutManager,
    layoutRenderer,
    bgColor = "#f9f9f9",
    padding = 8
  }) {
    super({ id, context, layoutManager, layoutRenderer });
    this.bgColor = bgColor;
    this.padding = padding;
  }

  addChild(child) {
    super.addChild(child);
    this.layoutChildrenVertically(this.padding, 30);
  }
  layoutChildrenVertically(spacing, defaultHeight) {
    
    const containerBounds = this.layoutManager.getLogicalBounds(this.id);
    if (!containerBounds) return;
    let currentY = containerBounds.y + spacing;
    for (const child of this.children) {
      this.layoutManager.setLogicalBounds(child.id, {
        x: containerBounds.x + spacing,
        y: currentY,
        width: containerBounds.width - 2 * spacing,
        height: defaultHeight
      });
      currentY += defaultHeight + spacing;
    }
  }

  render() {
    if (!this.visible) return;

    const bounds = this.getScaledBounds();
    if (bounds && this.layoutRenderer?.ctx) {
      const ctx = this.layoutRenderer.ctx;
      ctx.save();
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
    }

    // render children on top of background
    for (const child of this.children) {
      child.render();
    }
  }
}