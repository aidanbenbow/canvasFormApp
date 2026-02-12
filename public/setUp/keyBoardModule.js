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

  
      keyboard.keyLayout.forEach((row, rowIndex) => {
        row.forEach((baseKey, keyIndex) => {
          const entry = { button: null, baseKey };
          const button = new ButtonNode({
            id: `key-${rowIndex}-${keyIndex}`,
            label: keyboard.getKeyLabel(baseKey),
            style: {
              radius: 10,
              background: "rgba(247, 247, 247, 0.85)",
              hoverBackground: "rgba(219, 234, 254, 0.9)",
              pressedBackground: "rgba(191, 219, 254, 0.95)",
              borderColor: "#cbd5e1",
              textColor: "#0f172a"
            },
            onClick: () => {
              const currentKey = entry.baseKey;

              if (currentKey === '⇧') {
                keyboard.toggleCase();
                const flat = keyboard.getFlatLayout();
                keyboard.keyButtons.forEach((entry, index) => {
                  entry.baseKey = flat[index] ?? entry.baseKey;
                  entry.button.label = keyboard.getKeyLabel(entry.baseKey);
                });
                keyboard.invalidate();
                return;
              }

              if (currentKey === 'SYM' || currentKey === 'ABC') {
                keyboard.toggleMode();
                const flat = keyboard.getFlatLayout();
                keyboard.keyButtons.forEach((entry, index) => {
                  entry.baseKey = flat[index] ?? entry.baseKey;
                  entry.button.label = keyboard.getKeyLabel(entry.baseKey);
                });
                keyboard.invalidate();
                return;
              }

              const key = keyboard.getKeyLabel(currentKey);
              dispatcher.dispatch(ACTIONS.KEYBOARD.PRESS, { key });
            }
          });

          entry.button = button;
          keyboard.keyButtons.push(entry);
          keyboard.add(button);
        });
      });
  
      return keyboard;
    }
  };