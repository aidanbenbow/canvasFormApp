

export class CaretController {
    constructor(editor){
        this.editor = editor;
        this.caretIndex = 0;
        this.selectionStart = 0
        this.selectionEnd = 0
    }
    setCaretToEnd(text) {
        const length = text.length;
        this.caretIndex = length;
        this.selectionStart = length;
        this.selectionEnd = length;
    }
    normalizeSelection() {
        if (this.selectionStart !== null && this.selectionEnd !== null) {
            if (this.selectionStart > this.selectionEnd) {
                [this.selectionStart, this.selectionEnd] = [this.selectionEnd, this.selectionStart];
            }
        }}
        moveCaretLinearly(offset, shiftKey) {
            const text = this.editor.textModel.getText();
            if(!text) return;
            let pos = this.caretIndex + offset;
            pos = Math.max(0, Math.min(pos, text.length));
            this.caretIndex = pos;
            if(shiftKey){
                this.selectionEnd = pos
            } else {
                this.selectionStart = this.selectionEnd = pos
            }
this.normalizeSelection();
this.editor.pipeline.invalidate();
        }

    draw(ctx){
        if(!this.editor.activeBox||!this.editor.blinkState) return;
        const text = this.editor.textModel.getText();
        const before = text.slice(0,this.caretIndex);
        const bounds = this.editor.layoutManager.getScaledBounds(this.editor.activeBox.id, ctx.canvas.width, ctx.canvas.height);
        if(!bounds) return;
        const fontRatio =0.01
        const textWidth = this.editor.layoutRenderer.getTextWidth(before, fontRatio);

        const x = bounds.x + textWidth;
        const y = bounds.y + bounds.height * 0.5 - (fontRatio * ctx.canvas.height) * 0.5;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + fontRatio * ctx.canvas.height);
        ctx.stroke();

    }

    drawSelection(ctx){
        if(!this.editor.activeBox) return;
        const text = this.editor.textModel.getText();
        if(this.selectionStart === null || this.selectionEnd === null) return;
        const start = Math.min(this.selectionStart, this.selectionEnd);
        const end = Math.max(this.selectionStart, this.selectionEnd);
        const beforeSelection = text.slice(0, start);
        const selectionText = text.slice(start, end);
        const bounds = this.editor.layoutManager.getScaledBounds(this.editor.activeBox.id, ctx.canvas.width, ctx.canvas.height);
        if(!bounds) return;
        const fontRatio =0.01
        const beforeWidth = this.editor.layoutRenderer.getTextWidth(beforeSelection, fontRatio);
        const selectionWidth = this.editor.layoutRenderer.getTextWidth(selectionText, fontRatio);

        const x = bounds.x + beforeWidth;
        const y = bounds.y + bounds.height * 0.5 - (fontRatio * ctx.canvas.height) * 0.5;
        ctx.fillStyle = 'rgba(0, 120, 215, 0.3)';
        ctx.fillRect(x, y, selectionWidth, fontRatio * ctx.canvas.height);
    }
   
}