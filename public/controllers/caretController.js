

export class CaretController {
    constructor(editor){
        this.editor = editor;
        
        this.caretIndex = 0;
        this.selectionStart = 0
        this.selectionEnd = 0
        this.selectionAnchor = 0
    }
    setCaretToEnd(text) {
        const length = text.length;
        this.caretIndex = length;
        this.selectionStart = length;
        this.selectionEnd = length;
        this.selectionAnchor = length;
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
          // if starting a new selection
          if (this.selectionStart === this.selectionEnd) {
              this.selectionAnchor = this.selectionStart;
          }
          this.selectionStart = this.selectionAnchor;
          this.selectionEnd = pos;
      } else {
          this.selectionStart = this.selectionEnd = pos;
          this.selectionAnchor = pos; // reset anchor
      }
    
        this.normalizeSelection();
        this.editor.pipeline.invalidate();
      }

      // ✅ NEW: Move caret directly to a specific position
  moveCaretTo(pos, shiftKey) {
    const node = this.editor.activeNode;
    if (!node) return;

    const text = node.value || "";
    pos = Math.max(0, Math.min(pos, text.length));
    this.caretIndex = pos;

    if (shiftKey) {
        if (this.selectionStart === this.selectionEnd) {
            this.selectionAnchor = this.selectionStart;
        }
        this.selectionStart = this.selectionAnchor;
        this.selectionEnd = pos;
    } else {
        this.selectionStart = this.selectionEnd = pos;
        this.selectionAnchor = pos;
    }

    this.normalizeSelection();
    this.editor.pipeline.invalidate();
}
moveCaretToMousePosition(x, y, ctx) {
  const node = this.editor.activeNode;
  if (!node) return;

  const { lines, lineHeight } = node._layout;
  const { bounds, style } = node;

  // Determine which line was clicked
  let lineIndex = Math.floor((y - bounds.y - style.paddingY) / lineHeight);
  lineIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));

  const line = lines[lineIndex];
  let clickX = x - bounds.x - style.paddingX;

  // Determine which character in the line is closest to clickX
  let closestIndex = line.startIndex; // start of line in full text
  let accumulatedWidth = 0;
  const text = node.value || "";

  for (let i = 0; i < line.text.length; i++) {
      const char = line.text[i];
      const charWidth = ctx.measureText(char).width;
      if (accumulatedWidth + charWidth / 2 >= clickX) {
          break;
      }
      accumulatedWidth += charWidth;
      closestIndex++;
  }

  // Move caret to that position
  this.moveCaretTo(closestIndex, false); // false → no shift selection
}

    drawCaret(ctx) {
        const node = this.editor.activeNode;
        if (!node || !this.editor.blinkState) return;
        ctx.font = node.style.font;
      
        const { x, y } = node.bounds;
        const { lines, lineHeight } = node._layout;
      
        let caretLine = 0;
        let caretOffset = 0;
      
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (this.caretIndex >= line.startIndex && this.caretIndex <= line.endIndex) {
              caretLine = i;
              caretOffset = this.caretIndex - line.startIndex;
              break;
          }
      }
      
      const lineText = lines[caretLine].text.slice(0, caretOffset);

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
    
        const { x, y } = node.bounds;
        const { lines, lineHeight } = node._layout;
    
        if (this.selectionStart === this.selectionEnd) return;
    
        let lineIndex = 0;
    
        for (const line of lines) {
            // compute the intersection of the line and selection
            const lineSelStart = Math.max(line.startIndex, Math.min(this.selectionStart, this.selectionEnd));
            const lineSelEnd = Math.min(line.endIndex, Math.max(this.selectionStart, this.selectionEnd));
    
            if (lineSelStart < lineSelEnd) {
                const relStart = lineSelStart - line.startIndex;
                const relEnd = lineSelEnd - line.startIndex;
    
                const before = line.text.slice(0, relStart);
                const selected = line.text.slice(relStart, relEnd);
    
                const selX = x + node.style.paddingX + ctx.measureText(before).width;
                const selY = y + node.style.paddingY + lineIndex * lineHeight;
                const selWidth = ctx.measureText(selected).width;
    
                ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
                ctx.fillRect(selX, selY, selWidth, lineHeight);
            }
    
            lineIndex++;
        }
    }
    
    
    
   
}