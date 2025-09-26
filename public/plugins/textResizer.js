export class TextSizerPlugin {
    constructor({ rendererRegistry }) {
        if (!rendererRegistry || typeof rendererRegistry.get !== 'function') {
            throw new Error('TextSizerPlugin requires a valid rendererRegistry');
          }
        
      this.rendererRegistry = rendererRegistry;
    }
  
    onTextUpdate(box, newText) {
      if (!box.autoResize) return;
  
      const renderer = this.rendererRegistry.get(box.type);
      if (typeof renderer?.measureTextSize !== 'function') return;
  
      const maxWidth = box.size.width * 0.8;
      const fontSize = box.fontSize;
      const minWidth = 150;
      const minHeight = 40;
      const newSize = renderer.measureTextSize(newText, fontSize, maxWidth);
      newSize.width = Math.max(newSize.width, minWidth);
newSize.height = Math.max(newSize.height, minHeight);
      box.resizeTo(newSize);
    }
  }