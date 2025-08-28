import { TextBoxRenderer } from "./renderers/boxes/textBox.js";
import { InputBoxRenderer } from "./renderers/boxes/inputBox.js";
import { FormIconRenderer } from "./renderers/formIcon.js";

export const canvasConfig = {
    main: {
        mainId: '#mainCanvas',
        hitId: '#mainHitCanvas',
        bg: 'grey',
        hitBg: 'red',
        width: 800,
        height: 600,
    }
}

export const myPluginManifest = {
    renderers: [
      {
        id: 'textBox',
        class: TextBoxRenderer
      },
      {
        id: 'inputBox',
        class: InputBoxRenderer
      }
    ]
  };