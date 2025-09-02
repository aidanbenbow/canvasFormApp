import { generateHitHex, getHitHex, getMousePosition, measureTextSize, createBoxFromFormItem, loadImage } from "../utils/utilities.js";


// plugins/coreUtilsPlugin.js
export const coreUtilsPlugin = {
    registerUtilities(registry) {
      registry.register('hit', 'generateHitHex', generateHitHex);
      registry.register('hit', 'getHitHex', getHitHex);
      registry.register('mouse', 'getMousePosition', getMousePosition);
      registry.register('text', 'measureTextSize', measureTextSize);
      registry.register('box', 'createBoxFromFormItem', createBoxFromFormItem);
      registry.register('asset', 'loadImage', loadImage);
    }
  };