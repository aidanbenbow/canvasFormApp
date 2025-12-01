//component to extend UITextEditing with input capabilities


import { UITextEditing } from "./UiTextEditing.js";

export class UIInput extends UITextEditing {
    constructor({ id, text='', placeholder='Enter text...', context, layoutManager, layoutRenderer, editor }) {
        super({ id, editor });
        this.text = text;
        this.placeholder = placeholder;
        this.context = context;
        this.layoutManager = layoutManager;
        this.layoutRenderer = layoutRenderer;
        this.type = 'input';
        this.interactive = true;
        this.draggable = true;
    }

    onClick() {
        UITextEditing.setFocus(this);
        this.editorController.startEditing(this, 'text');
    }

    render() {
        if (!this.visible) return;
        this.renderDragHighlight();
        const displayText = this.text || this.placeholder;
        const color = this.text ? '#000' : '#888'; // gray for placeholder
        this.layoutRenderer.drawText(
            this.id,
            displayText,
            0.04,
            {
                fill: color,
                align: 'left',
                valign: 'top'
            }
        );

        if(this.editorController?.activeBox === this) {
            const ctx = this.layoutRenderer.ctx; // assuming layoutRenderer exposes canvas context
            this.editorController.drawSelection(ctx);
            this.editorController.drawCaret(ctx);
        }
    }

    getValue() {
        return this.text;
    }

    updateText(newText) {
        this.text = newText;
    }
    
}