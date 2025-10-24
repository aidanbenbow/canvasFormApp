import { UIElement } from "./UiElement.js";

export class UIButton extends UIElement {
  constructor({ id, label, onClick}) {
    super({ id });
    this.label = label;
    this.onClickHandler = onClick;
    this.type = 'uiButton';
    this.interactive = true;

  }

  onClick() {
    this.onClickHandler?.();
  }

  render() {
    if (!this.visible) return;

    // Pick color based on interaction state
    let fill = '#007bff';
    if (this.isActive) fill = '#0056b3';
    else if (this.isHovered) fill = '#3399ff';

    // Focus outline
    const stroke = this.isFocused ? '#ffcc00' : '#004080';

    this.layoutRenderer.drawRect(this.id, {
      fill,
      stroke,
      lineWidth: this.isFocused ? 3 : 2
    });

    this.layoutRenderer.drawText(this.id, this.label, 0.01, {
      fill: '#fff',
      align: 'left',
      valign: 'middle'
    });
  }
}


// export class UIButton {
//   constructor({ id, label, onClick, layoutManager, layoutRenderer }) {
//     this.id = id; // layout zone ID
//     this.label = label;
//     this.onClick = onClick;
//     this.layoutManager = layoutManager;
//     this.layoutRenderer = layoutRenderer;
//     this.type = 'layout';
//   }

//   render() {
//     // Draw button background
//     this.layoutRenderer.drawRect(this.id, {
//       fill: '#007bff',
//       stroke: '#0056b3',
//       lineWidth: 2
//     });

//     // Draw button label
//     this.layoutRenderer.drawText(this.id, this.label, 16, {
//       fill: '#fff',
//       align: 'left'
//     });
//   }

//   contains(x, y) {
//     const bounds = this.layoutManager.getScaledBounds(this.id, this.layoutRenderer.canvas.width, this.layoutRenderer.canvas.height);
//     if (!bounds) return false;
//     return x >= bounds.x && x <= bounds.x + bounds.width &&
//            y >= bounds.y && y <= bounds.y + bounds.height;
//   }
// }
