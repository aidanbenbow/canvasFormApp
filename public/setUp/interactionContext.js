export class InteractionContext {
    constructor({ interactionManager, keyboardController, textEditorController, focusManager, selectionController, dragController }) {
        this.interactionManager = interactionManager;
        this.keyboardController = keyboardController;
        this.textEditorController = textEditorController;
        this.focusManager = focusManager;
        this.selectionController = selectionController;
        this.dragController = dragController;
    }
}