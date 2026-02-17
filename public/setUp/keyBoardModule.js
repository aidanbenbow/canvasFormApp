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
      let userOverrodeMode = false;
      let lastContextKey = null;

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
          if (keyboard.isSuggestionToken(entry.baseKey)) {
            entry.button.style.font = isSmallScreen() ? "20px sans-serif" : "14px sans-serif";
          }
        });
        keyboard.invalidate();
      };

      const suggestionDictionary = [
        "the", "and", "to", "for", "with", "that", "this", "from", "you", "your",
        "message", "report", "beneficiary", "support", "thank", "thanks", "hello", "dear"
      ];

      const labelSuggestionProfiles = [
        {
          match: /message\s*year|year|anul\s*mesajului|an/,
          profile: { type: 'year', preferredMode: 'alpha', chips: ["2026", "2025", "2024"] }
        },
        {
          match: /email|e-mail|mail/,
          profile: { type: 'email', preferredMode: 'punct', chips: ["@gmail.com", "@yahoo.com", ".com"] }
        },
        {
          match: /phone|mobile|tel|contact|telefon/,
          profile: { type: 'phone', preferredMode: 'punct', chips: ["+", "07", "254"] }
        },
        {
          match: /name|nume|numele|input-name/,
          profile: { type: 'name', preferredMode: 'alpha', chips: ["Dear", "Hello", "Thanks"] }
        },
        {
          match: /photo|image|url|link/,
          profile: { type: 'url', preferredMode: 'punct', chips: ["https://", ".com", ".jpg"] }
        },
        {
          match: /amount|price|total|number|qty|quantity|count|age/,
          profile: { type: 'number', preferredMode: 'alpha', chips: ["100", "500", "1000"] }
        },
        {
          match: /message|messageinput|mesaj|mesajul|report|raport|comment|feedback|article/,
          profile: { type: 'message', preferredMode: 'alpha', chips: ["thank", "support", "beneficiary"] }
        }
      ];

      const getActiveFieldContext = () => {
        const node = context?.textEditorController?.activeNode;
        if (!node) {
          return {
            nodeId: null,
            text: '',
            profile: {
              type: 'general',
              preferredMode: 'alpha',
              chips: ["hello", "thanks", "support"]
            }
          };
        }

        const labelText = String(node.label || '').toLowerCase();
        const idText = String(node.id || '').toLowerCase();
        const placeholderText = String(node.placeholder || '').toLowerCase();
        const valueText = String(node.value || '').toLowerCase();

        const contextText = `${labelText} ${idText} ${placeholderText} ${valueText}`.trim();

        const withProfile = (type, preferredMode, chips) => ({
          type,
          preferredMode,
          chips
        });

        const resolveMappedProfile = (lookupText) => {
          const mapped = labelSuggestionProfiles.find((entry) => entry.match.test(lookupText));
          return mapped ? mapped.profile : null;
        };

        const labelDriven = `${labelText} ${idText}`;
        const broadContext = `${labelText} ${idText} ${placeholderText}`;

        let profile = withProfile('general', 'alpha', ["hello", "thanks", "support"]);
        const mappedByLabel = resolveMappedProfile(labelDriven);
        const mappedByContext = resolveMappedProfile(broadContext);
        if (mappedByLabel) {
          profile = withProfile(mappedByLabel.type, mappedByLabel.preferredMode, mappedByLabel.chips);
        } else if (mappedByContext) {
          profile = withProfile(mappedByContext.type, mappedByContext.preferredMode, mappedByContext.chips);
        }

        return {
          nodeId: node.id || null,
          text: contextText,
          profile
        };
      };

      const applySmartFieldMode = ({ force = false } = {}) => {
        const { profile } = getActiveFieldContext();
        if (!profile?.preferredMode) return false;
        if (!force && userOverrodeMode) return false;
        if (keyboard.mode === profile.preferredMode) return false;
        keyboard.setMode(profile.preferredMode);
        return true;
      };

      const getEditorState = () => {
        const editor = context.textEditorController;
        if (!editor?.activeNode || !editor?.textModel) {
          return { text: "", caretIndex: 0 };
        }
        return {
          text: editor.textModel.getText?.() ?? "",
          caretIndex: editor.caretController?.caretIndex ?? 0
        };
      };

      const getCurrentWordPrefix = (text, caretIndex) => {
        const safeCaret = Math.max(0, Math.min(caretIndex, text.length));
        const left = text.slice(0, safeCaret);
        const match = left.match(/[A-Za-z]+$/);
        return match ? match[0] : "";
      };

      const updateSuggestions = () => {
        const { text, caretIndex } = getEditorState();
        const prefix = getCurrentWordPrefix(text, caretIndex);
        const lowerPrefix = prefix.toLowerCase();
        const { nodeId, profile } = getActiveFieldContext();
        const contextKey = `${nodeId || 'none'}:${profile.type}`;

        if (contextKey !== lastContextKey) {
          const modeChanged = applySmartFieldMode();
          if (modeChanged) {
            refreshKeyLabels();
          }
          lastContextKey = contextKey;
        }

        const dynamicWords = Array.from(new Set((text.match(/[A-Za-z]{3,}/g) || []).map((word) => word.toLowerCase())));
        const contextualChips = Array.from(new Set((profile?.chips || []).map((word) => String(word).trim()).filter(Boolean)));
        const safeDictionary = (profile?.type === 'message' || profile?.type === 'general')
          ? suggestionDictionary.filter((word) => !/^\d+$/.test(String(word)))
          : suggestionDictionary;
        const candidatePool = Array.from(new Set([...contextualChips, ...dynamicWords, ...safeDictionary]));

        let nextSuggestions = [];
        if (lowerPrefix) {
          nextSuggestions = candidatePool
            .filter((word) => String(word).toLowerCase().startsWith(lowerPrefix) && String(word).toLowerCase() !== lowerPrefix)
            .slice(0, 3);
        } else {
          nextSuggestions = contextualChips.slice(0, 3);
        }

        if (nextSuggestions.length < 3) {
          const fallback = candidatePool.filter((word) => !nextSuggestions.includes(word));
          nextSuggestions = [...nextSuggestions, ...fallback].slice(0, 3);
        }

        keyboard.setSuggestions(nextSuggestions);
        refreshKeyLabels();
      };

      const applySuggestion = (suggestion) => {
        const editor = context.textEditorController;
        if (!editor?.activeNode || !editor?.textModel) return;

        const text = editor.textModel.getText?.() ?? "";
        const caret = editor.caretController;
        const caretIndex = caret?.caretIndex ?? 0;
        const safeCaret = Math.max(0, Math.min(caretIndex, text.length));
        const left = text.slice(0, safeCaret);
        const right = text.slice(safeCaret);
        const prefixMatch = left.match(/[A-Za-z]+$/);
        const prefixLength = prefixMatch ? prefixMatch[0].length : 0;

        const beforePrefix = left.slice(0, left.length - prefixLength);
        const insertion = `${suggestion} `;
        const newText = beforePrefix + insertion + right;

        editor.textModel.setText(newText);
        const nextCaret = beforePrefix.length + insertion.length;
        if (caret) {
          caret.caretIndex = nextCaret;
          caret.selectionStart = nextCaret;
          caret.selectionEnd = nextCaret;
          caret.selectionAnchor = nextCaret;
        }
        editor.pipeline.invalidate();
        updateSuggestions();
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
          setTimeout(updateSuggestions, 0);
          return;
        }

        if (keyboard.isSuggestionToken(currentKey)) {
          const index = keyboard.getSuggestionIndex(currentKey);
          const suggestion = keyboard.suggestions[index];
          if (suggestion && suggestion !== '...') {
            applySuggestion(suggestion);
          }
          return;
        }

        if (currentKey === '⇧') {
          userOverrodeMode = true;
          keyboard.toggleCase();
          keyboard.shiftOnce = keyboard.isUppercase;
          refreshKeyLabels();
          return;
        }

        if (currentKey === 'SYM' || currentKey === 'ABC') {
          userOverrodeMode = true;
          keyboard.toggleMode();
          refreshKeyLabels();
          return;
        }

        const key = keyboard.getKeyLabel(currentKey);
        dispatchKeyPress(key);
        setTimeout(updateSuggestions, 0);

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
  userOverrodeMode = false;
  lastContextKey = null;
  applySmartFieldMode({ force: true });
  keyboard.visible = true;
  updateSuggestions();
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

function isSmallScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}