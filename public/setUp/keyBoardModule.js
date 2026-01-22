import { ButtonNode } from "../components/nodes/buttonNode.js";
import { KeyboardNode } from "../components/nodes/keyboardNode.js";

export const KeyboardModule = {
    create(dispatcher) {
      const keyboard = new KeyboardNode({
        id: 'keyboard-layer',
        layout: 'keyboard',
        style: {
          position: 'absolute',
          bottom: '0',
          width: '100%',
          backgroundColor: '#ccc'
        }
      });
  
      keyboard.keyLayout.forEach((row, rowIndex) => {
        row.forEach((key, keyIndex) => {
          keyboard.add(
            new ButtonNode({
              id: `key-${rowIndex}-${keyIndex}`,
              label: key,
              onClick: () => {
                dispatcher.dispatch(ACTIONS.KEYBOARD.PRESS, { key });
              }
            })
          );
        });
      });
  
      return keyboard;
    }
  };