export class TextModel{
    constructor(editor){
        this.editor = editor;
    }
    getText() {
        const node = this.editor.activeNode;
        if (!node) return '';
        return node.getValue ? node.getValue() : node.value || '';
      }
    setText(newText){
        const box = this.editor.activeNode;
     
        if(!box) return;

        if(typeof box.updateText === 'function'){
            box.updateText(newText);
        }
        this.editor.pipeline.invalidate();
    }
    replaceSelection(newText){
        const box = this.editor.activeNode;
        
        const caret = this.editor.caretController
        const original = this.getText();
      const safeText = newText ?? "";
      const before = original.slice(0, caret.selectionStart);
      const after = original.slice(caret.selectionEnd);
      const updated = before + safeText + after;
        this.setText(updated);
      const newCaretPos = before.length + safeText.length;
        caret.caretIndex = newCaretPos;
        caret.selectionStart = newCaretPos;
        caret.selectionEnd = newCaretPos;

        this.editor.pipeline.invalidate();
    }
    insert(text){
        this.replaceSelection(text);
    }
    backSpace(){
        const caret = this.editor.caretController
        if(caret.selectionStart !== caret.selectionEnd){
            this.replaceSelection('');
            return;
        }
        if(caret.caretIndex === 0) return;
        caret.selectionStart = caret.caretIndex - 1;
        this.replaceSelection('');
    }
}

export function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let currentLine = "";
  
    for (const char of text) {
      const testLine = currentLine + char;
      const width = ctx.measureText(testLine).width;
  
      if (width > maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
  
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  /**
 * Wrap text by words, not characters.
 * Returns array of lines that fit in maxWidth.
 */
export function wrapTextByWords(ctx, text, maxWidth) {
  if (!text) return [];

  const lines = [];
  const parts = text.split("\n");
  let globalIndex = 0;

  parts.forEach((part, partIndex) => {
    if (part.length === 0) {
      lines.push({ text: "", startIndex: globalIndex, endIndex: globalIndex });
    } else {
      const partLines = wrapTextByWordsNoNewline(ctx, part, maxWidth, globalIndex);
      lines.push(...partLines);
    }

    globalIndex += part.length;
    if (partIndex < parts.length - 1) {
      globalIndex += 1; // account for the newline character
    }
  });

  return lines;
}

function wrapTextByWordsNoNewline(ctx, text, maxWidth, offset) {
  const tokens = text.match(/\s+|[^\s]+/g) || [];
  const lines = [];
  let currentLine = "";
  let lineStartIndex = offset;
  let currentIndex = offset;

  for (const token of tokens) {
    if (!currentLine) {
      lineStartIndex = currentIndex;
    }

    const testLine = currentLine + token;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      currentIndex += token.length;
      continue;
    }

    if (currentLine) {
      lines.push({
        text: currentLine,
        startIndex: lineStartIndex,
        endIndex: lineStartIndex + currentLine.length
      });
      currentLine = "";
    }

    lineStartIndex = currentIndex;

    if (ctx.measureText(token).width <= maxWidth) {
      currentLine = token;
      currentIndex += token.length;
      continue;
    }

    // Hard break long tokens (including long whitespace runs)
    let partial = "";
    for (const char of token) {
      const testPartial = partial + char;
      if (ctx.measureText(testPartial).width <= maxWidth || partial === "") {
        partial = testPartial;
        currentIndex += 1;
      } else {
        lines.push({
          text: partial,
          startIndex: lineStartIndex,
          endIndex: lineStartIndex + partial.length
        });
        lineStartIndex += partial.length;
        partial = char;
        currentIndex += 1;
      }
    }

    currentLine = partial;
  }

  if (currentLine) {
    lines.push({
      text: currentLine,
      startIndex: lineStartIndex,
      endIndex: lineStartIndex + currentLine.length
    });
  }

  return lines;
}

