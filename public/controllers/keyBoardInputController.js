

export class KeyBoardInputController {
    constructor(editor){
        this.editor = editor;
        this.boundHandler = (event) => this.handleKeyDown(event);
    }

    enable() {
        window.addEventListener('keydown', this.boundHandler);
    }

    disable() {
        window.removeEventListener('keydown', this.boundHandler);
    }
    handleKeyDown(event) {
        if (!this.editor.activeBox) return;

        if(event.key.length === 1){
            event.preventDefault();
            this.editor.insertText(event.key);
            return;
        }
        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                this.editor.deleteTextBeforeCaret();
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