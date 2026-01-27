
import { dispatcher } from "../app.js";
import { ACTIONS } from "../events/actions.js";


export class KeyBoardInputController {
    constructor(editor){
        this.editor = editor;
       
        this.boundHandler = (event) => this.handleKeyDown(event);
    }

    enable() {
        window.addEventListener('keydown', this.boundHandler);
        dispatcher.on(ACTIONS.KEYBOARD.PRESS, ({ key }) => this.handleVirtualKey(key));
      }
      
      disable() {
        window.removeEventListener('keydown', this.boundHandler);
        dispatcher.off(ACTIONS.KEYBOARD.PRESS); // remove subscription if your dispatcher supports it
      }
      
      handleVirtualKey(key) {
        if (!this.editor.activeNode) return;
        if (key === 'Backspace' || key === '←') this.editor.backspace();
        else if (key === 'Space') this.editor.insertText(' ');
        else if (key === '↵') this.editor.insertText('\n');
        else this.editor.insertText(key);
      }
    handleKeyDown(event) {
        if (!this.editor.activeNode) return;

        if(event.key.length === 1){
            event.preventDefault();
            this.editor.insertText(event.key);
            return;
        }
        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                this.editor.backspace();
                break;
            case 'Delete':
                event.preventDefault();
                this.editor.deleteTextAfterCaret();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.editor.moveCaretLinearly(-1, event.shiftKey);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.editor.moveCaretLinearly(1, event.shiftKey);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.editor.moveCaretUp(event.shiftKey);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.editor.moveCaretDown(event.shiftKey);
                break;
            case 'Enter':
                event.preventDefault();
                this.editor.insertText('\n');
                break;
            case 'Escape':
                event.preventDefault();
                this.editor.stopEditing();
                break;
        }
    }
}