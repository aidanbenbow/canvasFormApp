export class FormLayoutHelper {
    constructor(layoutManager, options = {}) {
      this.layoutManager = layoutManager;
      this.formWidth = options.formWidth || layoutManager.logicalWidth * 0.6;
      this.fieldHeight = options.fieldHeight || 40;
      this.spacing = options.spacing || 20;
      this.startY = options.startY || 20;
    }
  
    centerX(width) {
        const logicalWidth = this.formWidth*2
      return (logicalWidth - width) / 2;
    }
  
    generateLayout(fieldConfigs) {
      const layout = {};
      let currentY = this.startY;
  
      fieldConfigs.forEach(({ id, height, width }) => {
        const fieldWidth = width || this.formWidth;
        const fieldHeight = height || this.fieldHeight;
        layout[id] = {
          x: this.centerX(fieldWidth),
          y: currentY,
          width: fieldWidth,
          height: fieldHeight
        };
        currentY += fieldHeight + this.spacing;
      });
  
      return layout;
    }
  }