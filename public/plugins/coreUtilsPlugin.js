
import { generateHitHex, getHitHex, getMousePosition, measureTextSize, createBoxFromFormItem, loadImage, normalizePos, scaleToCanvas, scaleFromCanvas, getLogicalMousePosition, getHitHexFromEvent, scaleRectToCanvas, getLogicalFontSize } from "../utils/utilities.js";


// plugins/coreUtilsPlugin.js

export function coreUtilsPlugin(context) {
 
  return {
    registerUtilities(registry) {
      registry.register('hit', 'generateHitHex', generateHitHex);
      registry.register('hit', 'getHitHex', getHitHex);
      registry.register('mouse', 'getMousePosition', getMousePosition);
      registry.register('mouse', 'getLogicalMousePosition', getLogicalMousePosition
      );
      registry.register('text', 'measureTextSize', measureTextSize);
      registry.register('box', 'createBoxFromFormItem', createBoxFromFormItem);
      registry.register('asset', 'loadImage', loadImage);
      registry.register('normalise', 'normalizePos', normalizePos);
      registry.register('hit', 'getHitHexFromEvent', getHitHexFromEvent);
      registry.register('layout', 'scaleToCanvas', scaleToCanvas);
      registry.register('layout', 'scaleFromCanvas', scaleFromCanvas);
      registry.register('layout', 'getLogicalDimensions', () => {
        // const { width, height } = context.canvasManager.getCanvasSize();
        return { width:1000, height:1000 };
      });
      registry.register('canvas', 'getCanvasSize', context.canvasManager.getCanvasSize.bind(context.canvasManager));
      registry.register('layout', 'scaleRectToCanvas', scaleRectToCanvas);
      registry.register('layout', 'getLogicalFontSize', getLogicalFontSize);
  }
}
}
