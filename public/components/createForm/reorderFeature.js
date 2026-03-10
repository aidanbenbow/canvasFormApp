import { FormReorderController } from '../../controllers/formReorderController.js';
import { SceneHitTestSystem } from '../../events/sceneHitTestSystem.js';

export class ReorderFeature {
  constructor({
    context,
    dragThreshold = 8,
    getContainer,
    editorState,
    getRootNode,
    resolveFieldGroupIdFromNode,
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
      getContainer,
      dragThreshold,
      getRootNode,
      resolveFieldGroupIdFromNode,
      getSelectedFieldId: () => this.editorState?.getSelectedFieldId?.(),
      onSelectField: (fieldId) => this.handleSelectionRequest(fieldId),
      hitTestSystem: new SceneHitTestSystem(),
      onReorder: (sourceFieldId, targetFieldId) =>
        this.handleReorder(sourceFieldId, targetFieldId),
      onPreviewTargetChange: (fieldId) => this.handlePreviewTargetChange(fieldId),
      onDragStateChange: ({ active, sourceFieldId }) =>
        this.handleDragStateChange({ active, sourceFieldId })
    });
  }

  handleSelectionRequest(fieldId) {
    const nextSelectedFieldId = fieldId ?? null;
    if (this.editorState?.getSelectedFieldId?.() === nextSelectedFieldId) return;

    this.stopActiveEditing?.();
    this.editorState?.set({
      selectedFieldId: nextSelectedFieldId,
      previewInsertionBeforeFieldId: null
    });
    this.refreshFormContainer?.();
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

  onRender() {
    return false;
  }

  onRuntime() {
    return true;
  }
}