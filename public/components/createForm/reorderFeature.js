import { FormReorderController } from '../../controllers/formReorderController.js';

export class ReorderFeature {
  constructor({
    context,
    dragThreshold = 8,
    getRootNode,
    resolveFieldIdFromNode,
    reorderFields,
    clearDragPreviewState,
    refreshFormContainer,
    onPreviewTargetChange,
    onDragStateChange
  } = {}) {
    this.reorderFields = reorderFields;
    this.clearDragPreviewState = clearDragPreviewState;
    this.refreshFormContainer = refreshFormContainer;

    this.controller = new FormReorderController({
      context,
      dragThreshold,
      getRootNode,
      resolveFieldIdFromNode,
      onReorder: (sourceFieldId, targetFieldId) =>
        this.handleReorder(sourceFieldId, targetFieldId),
      onPreviewTargetChange,
      onDragStateChange
    });
  }

  handleReorder(sourceFieldId, targetFieldId) {
    this.reorderFields?.(sourceFieldId, targetFieldId);
    this.clearDragPreviewState?.();
    this.refreshFormContainer?.();
  }

  attach() {
    this.controller.attach();
  }

  detach() {
    this.controller.detach();
  }
}