import { FormReorderController } from '../../controllers/formReorderController.js';

export class ReorderFeature {
  constructor({
    context,
    dragThreshold = 8,
    editorState,
    getRootNode,
    resolveFieldIdFromNode,
    reorderFields,
    stopActiveEditing,
    applyPreviewVisuals,
    refreshFormContainer,
  } = {}) {
    this.editorState = editorState;
    this.reorderFields = reorderFields;
    this.stopActiveEditing = stopActiveEditing;
    this.applyPreviewVisuals = applyPreviewVisuals;
    this.refreshFormContainer = refreshFormContainer;

    this.controller = new FormReorderController({
      context,
      dragThreshold,
      getRootNode,
      resolveFieldIdFromNode,
      onReorder: (sourceFieldId, targetFieldId) =>
        this.handleReorder(sourceFieldId, targetFieldId),
      onPreviewTargetChange: (fieldId) => this.handlePreviewTargetChange(fieldId),
      onDragStateChange: ({ active, sourceFieldId }) =>
        this.handleDragStateChange({ active, sourceFieldId })
    });
  }

  handlePreviewTargetChange(fieldId) {
    const nextPreviewFieldId = fieldId ?? null;
    if (this.editorState?.getPreviewInsertionBeforeFieldId?.() === nextPreviewFieldId) return;

    this.editorState?.set({
      previewInsertionBeforeFieldId: nextPreviewFieldId
    });
    this.applyPreviewVisuals?.();
  }

  handleDragStateChange({ active, sourceFieldId }) {
    const nextDraggingFieldId = active ? (sourceFieldId ?? null) : null;
    if (this.editorState?.getDraggingFieldId?.() === nextDraggingFieldId) return;

    if (active) {
      this.stopActiveEditing?.();
    }

    this.editorState?.set({
      draggingFieldId: nextDraggingFieldId
    });
    this.refreshFormContainer?.();
  }

  handleReorder(sourceFieldId, targetFieldId) {
    this.reorderFields?.(sourceFieldId, targetFieldId);
    this.editorState?.set({
      previewInsertionBeforeFieldId: null,
      draggingFieldId: null
    });
    this.refreshFormContainer?.();
  }

  attach() {
    this.controller.attach();
  }

  detach() {
    this.controller.detach();
  }
}