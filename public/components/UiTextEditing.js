//component to provide text editing features to other components

import { UIElement } from "./UiElement.js";

export class UITextEditing extends UIElement{
    constructor({ id, editor }) {
        super({ id });
        this.editorController = editor;
        this.activeBox = null;
        this.editProperty = null;
    }
    onClick() {
        UIElement.setFocus(this);
        this.editorController.startEditing(this, 'text');
    }

}