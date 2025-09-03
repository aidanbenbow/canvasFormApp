export class TextEditorController {
    constructor(pipeline) {
        this.activeBox = null;
        this.activeField = null; // Not used in this controller, but kept for consistency
        this.caretIndex = 0;
        this.blinkState = true;
        this.pipeline = pipeline;

        this.selectionStart = this.caretIndex;
        this.selectionEnd = this.caretIndex;

        this.initCaretBlink();
        this.initKeyboardListeners();
    }

    handle(box){
        this.startEditing(box);
    }
    startEditing(box, field = 'text') {
        //if (box.type !== 'textBox') return;
        const value = typeof box[field] === 'string' ? box[field] : '';

        this.activeBox = box;
        this.activeField = field; // Not used in this controller, but kept for consistency
        this.caretIndex = value.length;
        this.selectionStart = this.selectionEnd= this.caretIndex;
        this.pipeline.invalidate();
    }

    stopEditing() {
        this.activeBox = null;
        this.activeField = null; // Not used in this controller, but kept for consistency
        this.pipeline.invalidate();
    }

    insertChar(char) {
        if (!this.activeBox||!this.activeField) return;

        const field = this.activeField; // Use the active field for text insertion
        const text = this.activeBox[field]
        const newText = text.slice(0, this.caretIndex) + char + text.slice(this.caretIndex);

        this.activeBox[field] = newText;
           
        this.caretIndex++;
        this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position

        if (typeof this.activeBox.updateText === 'function' && field === 'text') {
            this.activeBox.updateText(newText);
          }
        
        this.pipeline.invalidate();
    }

    deleteChar() {
        if (!this.activeBox || !this.activeField || this.caretIndex === 0) return;

        const field = this.activeField; // Use the active field for text deletion
        const text = this.activeBox[field]
        const newText = text.slice(0, this.caretIndex - 1) + text.slice(this.caretIndex);
        this.activeBox[field] = newText;
            
        this.caretIndex--;
        this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position
        if (typeof this.activeBox.updateText === 'function' && field === 'text') {
            this.activeBox.updateText(newText);
          }
        
        this.pipeline.invalidate();
    }

    moveCaretLeft(shiftKey = false) {
        if (!this.activeBox || !this.activeField) return;
        if (this.caretIndex > 0) {
            this.caretIndex--;
            if( shiftKey) {
                this.selectionEnd = this.caretIndex; // Extend selection to the left
            } else {
            this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position
            }
            this.pipeline.invalidate();
        }
    }

    moveCaretRight(shiftKey = false) {
        if (!this.activeBox || !this.activeField) return;
        const field = this.activeField; // Use the active field for caret movement
        const text = this.activeBox[field];
        if (this.caretIndex < text.length) {
            this.caretIndex++;
            if(shiftKey) {
                this.selectionEnd = this.caretIndex; // Extend selection to the right
            } else {
            this.selectionStart = this.selectionEnd = this.caretIndex; // Reset selection to caret position
            }
            this.pipeline.invalidate();
        }
    }

    initCaretBlink() {
        setInterval(() => {
            this.blinkState = !this.blinkState;
            if (this.activeBox) this.pipeline.invalidate();
        }, 500);
    }

    initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if(e.key === ' '){
                e.preventDefault(); // Prevent default space behavior
            }
            if (!this.activeBox) return;

            if (e.key.length === 1) {
                this.insertChar(e.key);
            } else if (e.key === 'Backspace') {
                this.deleteChar();
            } else if (e.key === 'ArrowLeft') {
                this.moveCaretLeft(e.shiftKey);
            } else if (e.key === 'ArrowRight') {
                this.moveCaretRight(e.shiftKey);
            } else if (e.key === 'Escape') {
                this.stopEditing();
            } else if(e.key === ' '){
                e.preventDefault(); // Prevent default space behavior
                this.insertChar(' ');
            }
        });
    }

    drawCaret(ctx) {
        
        if (!this.activeBox|| !this.activeField || !this.blinkState) return;

        const field = this.activeField; // Use the active field for caret drawing
        const textBeforeCaret = this.activeBox[field].slice(0, this.caretIndex);
        const metrics = ctx.measureText(textBeforeCaret);
        let baseX = this.activeBox.startPosition.x
        if(field === 'text') baseX += 65 // Adjust for text box padding
        else if(field === 'label') baseX += 10; // Adjust for label box padding
        const x = baseX + metrics.width;
        const y = this.activeBox.startPosition.y + this.activeBox.size.height / 2;

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
    }
    drawSelection(ctx) {
        if (!this.activeBox|| !this.activeField || this.selectionStart === this.selectionEnd) return;

        const field = this.activeField; // Use the active field for selection drawing
        const text = this.activeBox[field]
        const before = text.slice(0, this.selectionStart);
        const selected = text.slice(this.selectionStart, this.selectionEnd);

       let baseX = this.activeBox.startPosition.x
        if(field === 'text') baseX += 65 // Adjust for text box padding
        else if(field === 'label') baseX += 10; // Adjust for label box padding
        const startX = baseX + ctx.measureText(before).width;
        const width = ctx.measureText(selected).width;
        const y = this.activeBox.startPosition.y + this.activeBox.size.height / 2 - 10; // Adjust for vertical alignment

        ctx.fillStyle = 'rgba(200, 200, 255, 0.5)'; // Light blue selection color
        ctx.fillRect(startX, y, width, 20); // Draw selection rectangle
    }
}