

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
        if (this.selectionStart > this.selectionEnd) {
          [this.selectionStart, this.selectionEnd] =
            [this.selectionEnd, this.selectionStart];
        }
      }
    
      moveCaret(offset, shiftKey) {
        const node = this.editor.activeNode;
        if (!node) return;
    
        const text = node.value || "";
        let pos = this.caretIndex + offset;
        pos = Math.max(0, Math.min(pos, text.length));
    
        this.caretIndex = pos;
    
        if (shiftKey) {
          this.selectionEnd = pos;
        } else {
          this.selectionStart = this.selectionEnd = pos;
        }
    
        this.normalizeSelection();
        this.editor.pipeline.invalidate();
      }
    
    drawCaret(ctx) {
        const node = this.editor.activeNode;
        if (!node || !this.editor.blinkState) return;
      
        const { x, y } = node.bounds;
        const { lines, lineHeight } = node._layout;
        const text = node.value || "";
      
        let index = 0;
        let caretLine = 0;
        let caretOffset = 0;
      
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const nextIndex = index + line.length;
      
          if (this.caretIndex <= nextIndex) {
            caretLine = i;
            caretOffset = this.caretIndex - index;
            break;
          }
      
          index = nextIndex;
        }
      
        const lineText = lines[caretLine].slice(0, caretOffset);
        const caretX = x + node.style.paddingX + ctx.measureText(lineText).width;
        const caretY = y + node.style.paddingY + caretLine * lineHeight;
      
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(caretX, caretY);
        ctx.lineTo(caretX, caretY + lineHeight);
        ctx.stroke();
      }
    
      drawSelection(ctx) {
        const node = this.editor.activeNode;
        if (!node) return;
    
        const text = node.value || "";
        const { x, y } = node.bounds;
        const { lines, lineHeight } = node._layout;
    
        const start = Math.min(this.selectionStart, this.selectionEnd);
        const end = Math.max(this.selectionStart, this.selectionEnd);
    
        if (start === end) return; // no selection
    
        let index = 0;
        let lineIndex = 0;
    
        for (const line of lines) {
          const lineStart = index;
          const lineEnd = index + line.length;
    
          const selStart = Math.max(start, lineStart);
          const selEnd = Math.min(end, lineEnd);
    
          if (selStart < selEnd) {
            const before = text.slice(lineStart, selStart);
            const selected = text.slice(selStart, selEnd);
    
            const selX =
              x + node.style.paddingX + ctx.measureText(before).width;
    
            const selY =
              y + node.style.paddingY + lineIndex * lineHeight;
    
            const selWidth = ctx.measureText(selected).width;
    
            ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
            ctx.fillRect(selX, selY, selWidth, lineHeight);
          }
    
          index += line.length;
          lineIndex++;
        }
      }
    
   
}