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

      const isSymbolKey = (key) => {
        if (!key || key.length !== 1) return false;
        if (keyboard.isLetter(key)) return false;
        if (/\d/.test(key)) return false;
        return true;
      };

      const handleKeyAction = (entry) => {
        const currentKey = entry.baseKey;

        if (currentKey === '←') {
          startBackspaceRepeat();
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

        if (isSymbolKey(currentKey)) {
          keyboard.shiftOnce = true;
          if (!keyboard.isUppercase) {
            keyboard.toggleCase();
          }
          refreshKeyLabels();
        }
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
          background: '#0f172a',
          border: { color: '#1f2937', width: 1 },
          radius: 0
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
          const entry = { button: null, baseKey, handledOnPressStart: false };
          const button = new ButtonNode({
            id: `key-${rowIndex}-${keyIndex}`,
            label: keyboard.getKeyLabel(baseKey),
            style: {
              radius: 10,
              background: "#1f2937",
              hoverBackground: "#334155",
              pressedBackground: "#475569",
              borderColor: "#64748b",
              textColor: "#f8fafc",
              fontWeight: 600
            },
            onPressStart: () => {
              entry.handledOnPressStart = true;
              handleKeyAction(entry);
            },
            onPressEnd: () => {
              if (entry.baseKey === '←') {
                stopBackspaceRepeat();
              }
            },
            onClick: () => {
              if (entry.handledOnPressStart) {
                entry.handledOnPressStart = false;
                return;
              }
              handleKeyAction(entry);
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