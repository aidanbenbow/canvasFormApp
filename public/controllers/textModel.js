export class TextModel{
    constructor(editor){
        this.editor = editor;
    }
    getText(){
        const box = this.editor.activeBox;
        if(!box) return '';
        const field = this.editor.activeField;
        return typeof box[field] === 'string' ? box[field] : '';
    }
    setText(newText){
        const box = this.editor.activeBox;
        const field = this.editor.activeField;
        box[field] = newText;
        if(typeof box.insertText === 'function'){
            box.insertText(newText);
        }
        this.editor.pipeline.invalidate();
    }
    replaceSelection(newText){
        const box = this.editor.activeBox;
        const field = this.editor.activeField;
        const caret = this.editor.caretController
        const original = box[field] || '';
        const before = original.slice(0, caret.selectionStart);
        const after = original.slice(caret.selectionEnd);
        const updated = before + newText + after;
        this.setText(updated);
        const newCaretPos = before.length + newText.length;
        caret.caretIndex = newCaretPos;
        caret.selectionStart = newCaretPos;
        caret.selectionEnd = newCaretPos;

        if(typeof box.updateText === 'function'){
            box.updateText(updated);
        }
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
  