import { ButtonNode } from "../components/nodes/buttonNode.js";
import { KeyboardNode } from "../components/nodes/keyboardNode.js";
import { ACTIONS } from "../events/actions.js";

export const KeyboardModule = {
    create(dispatcher, context) {
      const keyboard = new KeyboardNode({
        id: 'keyboard-layer',
        context,
        layout: 'keyboard',
        style: {
          position: 'absolute',
          bottom: '0',
          width: '100%',
          backgroundColor: '#ccc'
        }
      });

      keyboard.visible = false;
keyboard.hitTestable = false;

          keyboard.keyButtons = [];

dispatcher.on(ACTIONS.KEYBOARD.SHOW, () => {
  keyboard.visible = true;
  keyboard.invalidate();
});

dispatcher.on(ACTIONS.KEYBOARD.HIDE, () => {
  keyboard.visible = false;
  keyboard.invalidate();
});

  
      keyboard.baseLayout.forEach((row, rowIndex) => {
        row.forEach((baseKey, keyIndex) => {
          const button = new ButtonNode({
            id: `key-${rowIndex}-${keyIndex}`,
            label: keyboard.getKeyLabel(baseKey),
            onClick: () => {
              if (baseKey === '⇧') {
                keyboard.toggleCase();
                keyboard.keyButtons.forEach(({ button, baseKey }) => {
                  button.label = keyboard.getKeyLabel(baseKey);
                });
                keyboard.invalidate();
                return;
              }

              const key = keyboard.getKeyLabel(baseKey);
              dispatcher.dispatch(ACTIONS.KEYBOARD.PRESS, { key });
            }
          });

          keyboard.keyButtons.push({ button, baseKey });
          keyboard.add(button);
        });
      });
  
      return keyboard;
    }
  };