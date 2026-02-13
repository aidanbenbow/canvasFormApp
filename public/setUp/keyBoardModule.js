import { ButtonNode } from "../components/nodes/buttonNode.js";
import { KeyboardNode } from "../components/nodes/keyboardNode.js";
import { ACTIONS } from "../events/actions.js";

export const KeyboardModule = {
    create(dispatcher, context) {
      let audioCtx = null;
      const playKeySound = () => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === "suspended") audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.value = 700;

        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      };

      let backspaceRepeatTimer = null;
      let backspaceRepeatTimeout = null;

      const stopBackspaceRepeat = () => {
        if (backspaceRepeatTimeout) {
          clearTimeout(backspaceRepeatTimeout);
          backspaceRepeatTimeout = null;
        }
        if (backspaceRepeatTimer) {
          clearInterval(backspaceRepeatTimer);
          backspaceRepeatTimer = null;
        }
      };

      const dispatchKeyPress = (key) => {
        playKeySound();
        dispatcher.dispatch(ACTIONS.KEYBOARD.PRESS, { key });
      };

      const refreshKeyLabels = () => {
        const flat = keyboard.getFlatLayout();
        keyboard.keyButtons.forEach((entry, index) => {
          entry.baseKey = flat[index] ?? entry.baseKey;
          entry.button.label = keyboard.getKeyLabel(entry.baseKey);
        });
        keyboard.invalidate();
      };

      const startBackspaceRepeat = () => {
        stopBackspaceRepeat();
        dispatchKeyPress('←');
        backspaceRepeatTimeout = setTimeout(() => {
          backspaceRepeatTimer = setInterval(() => {
            dispatchKeyPress('←');
          }, 60);
        }, 350);
      };

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
              background: "rgba(209, 213, 219, 0.95)",
              hoverBackground: "rgba(191, 219, 254, 0.95)",
              pressedBackground: "rgba(147, 197, 253, 0.98)",
              borderColor: "#94a3b8",
              textColor: "#0f172a"
            },
            onPressStart: () => {
              if (entry.baseKey === '←') {
                startBackspaceRepeat();
              }
            },
            onPressEnd: () => {
              if (entry.baseKey === '←') {
                stopBackspaceRepeat();
              }
            },
            onClick: () => {
              const currentKey = entry.baseKey;

              if (currentKey === '←') {
                return;
              }

              if (currentKey === 'Paste') {
                context.textEditorController?.pasteFromClipboard?.();
                return;
              }

              if (currentKey === '⇧') {
                keyboard.toggleCase();
                keyboard.shiftOnce = keyboard.isUppercase;
                refreshKeyLabels();
                return;
              }

              if (currentKey === 'SYM' || currentKey === 'ABC') {
                keyboard.toggleMode();
                refreshKeyLabels();
                return;
              }

              const key = keyboard.getKeyLabel(currentKey);
              dispatchKeyPress(key);

              if (keyboard.shiftOnce && keyboard.isLetter(currentKey)) {
                keyboard.shiftOnce = false;
                keyboard.toggleCase();
                refreshKeyLabels();
              }
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