

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
    
        const text = typeof node.getValue === "function" ? node.getValue() : (node.value || "");
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

                if (shiftKey && this.selectionStart !== this.selectionEnd && !this.editor.suppressSelectionMenu) {
                    this.editor.onSelectionChanged?.(null, "keyboard");
                } else if (!shiftKey) {
                    this.editor.hideSelectionMenu?.();
                }
      }

      // ✅ NEW: Move caret directly to a specific position
  moveCaretTo(pos, shiftKey) {
    const node = this.editor.activeNode;
    if (!node) return;

        const text = typeof node.getValue === "function" ? node.getValue() : (node.value || "");
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

        if (shiftKey && this.selectionStart !== this.selectionEnd && !this.editor.suppressSelectionMenu) {
            this.editor.onSelectionChanged?.(null, "keyboard");
        } else if (!shiftKey) {
            this.editor.hideSelectionMenu?.();
        }
}
moveCaretToMousePosition(x, y, ctx) {
  const node = this.editor.activeNode;
  if (!node) return;

        const closestIndex = this.getCaretIndexFromMousePosition(x, y, ctx);
        this.moveCaretTo(closestIndex, false); // false → no shift selection
    }

    getCaretIndexFromMousePosition(x, y, ctx) {
        const node = this.editor.activeNode;
        if (!node) return 0;
        if (!node._layout || !Array.isArray(node._layout.lines) || node._layout.lines.length === 0) {
            return 0;
        }

        ctx.font = node.style.font;
        const { lines, lineHeight } = node._layout;
        const { bounds, style } = node;

        const textTop = getTextAreaTop(node);
        const paddingY = style.paddingY || 0;
        const paddingX = style.paddingX || 0;

        // Determine which line was clicked
        const safeLineHeight = lineHeight || parseInt(node.style.font, 10) || 1;
        let lineIndex = Math.floor((y - textTop - paddingY) / safeLineHeight);
        lineIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));

        const line = lines[lineIndex];
        if (!line) {
            return 0;
        }
        const lineStartX = getLineStartX(node, line, ctx);
        const clickX = x - lineStartX;

        // Determine which character in the line is closest to clickX
        let closestIndex = line.startIndex;
        let accumulatedWidth = 0;

        for (let i = 0; i < line.text.length; i++) {
            const char = line.text[i];
            const charWidth = ctx.measureText(char).width;
            if (accumulatedWidth + charWidth / 2 >= clickX) {
                break;
            }
            accumulatedWidth += charWidth;
            closestIndex++;
        }

        return closestIndex;
    }

    selectWordAtMousePosition(x, y, ctx) {
        const node = this.editor.activeNode;
        if (!node) return;

        const text = typeof node.getValue === "function" ? node.getValue() : (node.value || "");
        if (!text) return;

        let index = this.getCaretIndexFromMousePosition(x, y, ctx);
        if (index >= text.length) index = text.length - 1;

        // If clicked on whitespace, move left to find a word char
        if (isWhitespace(text[index])) {
            let scan = index - 1;
            while (scan >= 0 && isWhitespace(text[scan])) scan--;
            if (scan < 0) return;
            index = scan;
        }

        let start = index;
        let end = index + 1;

        while (start > 0 && !isWhitespace(text[start - 1])) start--;
        while (end < text.length && !isWhitespace(text[end])) end++;

        this.selectionStart = start;
        this.selectionEnd = end;
        this.selectionAnchor = start;
        this.caretIndex = end;
        this.normalizeSelection();
        this.editor.pipeline.invalidate();
        if (!this.editor.suppressSelectionMenu) {
            this.editor.onSelectionChanged?.({ x, y }, "word");
        }
    }

    startSelectionAtMousePosition(x, y, ctx) {
        const index = this.getCaretIndexFromMousePosition(x, y, ctx);
        this.caretIndex = index;
        this.selectionStart = index;
        this.selectionEnd = index;
        this.selectionAnchor = index;
        this.editor.pipeline.invalidate();
    }

    updateSelectionToMousePosition(x, y, ctx) {
        const index = this.getCaretIndexFromMousePosition(x, y, ctx);
        this.caretIndex = index;
        this.selectionStart = this.selectionAnchor;
        this.selectionEnd = index;
        this.normalizeSelection();
        this.editor.pipeline.invalidate();

        if (!this.editor.suppressSelectionMenu && this.selectionStart !== this.selectionEnd) {
            this.editor.onSelectionChanged?.({ x, y }, "pointer");
        }
    }

    getCaretScenePosition(ctx) {
        const node = this.editor.activeNode;
        if (!node || !node._layout) return { x: 0, y: 0 };

        ctx.font = node.style.font;
        const y = getTextAreaTop(node);
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

        const line = lines[caretLine] || { text: "" };
        const lineText = line.text.slice(0, caretOffset);
        const caretX = getLineStartX(node, line, ctx) + ctx.measureText(lineText).width;
        const caretY = y + node.style.paddingY + caretLine * lineHeight;

        return { x: caretX, y: caretY };
    }

    drawCaret(ctx) {
        const node = this.editor.activeNode;
        if (!node || !this.editor.blinkState) return;
        ctx.font = node.style.font;

        const y = getTextAreaTop(node);
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
      
            const line = lines[caretLine] || { text: "" };
            const lineText = line.text.slice(0, caretOffset);

                const caretX = getLineStartX(node, line, ctx) + ctx.measureText(lineText).width;
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
    
        ctx.font = node.style.font;
        const y = getTextAreaTop(node);
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
    
                const lineStartX = getLineStartX(node, line, ctx);
                const selX = lineStartX + ctx.measureText(before).width;
                const selY = y + node.style.paddingY + lineIndex * lineHeight;
                const selWidth = ctx.measureText(selected).width;
    
                ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
                ctx.fillRect(selX, selY, selWidth, lineHeight);
            }
    
            lineIndex++;
        }
    }
    
    
    
   
}

function getTextAreaTop(node) {
    const layout = node?._layout || {};
    const wcHeight = layout.wordCountHeight ?? 0;
    const wcSpacing = layout.wordCountSpacing ?? 0;
    const offset = wcHeight > 0 ? wcHeight + wcSpacing : 0;
        return getRenderedNodeY(node) + offset;
}

function getRenderedNodeY(node) {
        let y = node?.bounds?.y ?? 0;
        let current = node?.parent;
        while (current) {
            if (current.scroll) {
                y -= current.scroll.offsetY || 0;
            }
            current = current.parent;
        }
        return y;
}

function getLineStartX(node, line, ctx) {
        const boundsX = node?.bounds?.x ?? 0;
        const boundsWidth = node?.bounds?.width ?? 0;
        const paddingX = node?.style?.paddingX || 0;
        const align = node?.style?.align || "left";
        const lineText = typeof line?.text === "string" ? line.text : "";
        const lineWidth = ctx.measureText(lineText).width;

        if (align === "center") {
            return boundsX + (boundsWidth - lineWidth) / 2;
        }

        if (align === "right") {
            return boundsX + boundsWidth - paddingX - lineWidth;
        }

        return boundsX + paddingX;
}

function isWhitespace(char) {
    return /\s/.test(char);
}