export class FormBuilderInteractionController {
  constructor({
    context,
    getRootNode,
    getFieldIds,
    resolveFieldIdFromNode,
    getDragHandlePresentation,
    isSmallScreen,
    stopActiveEditing,
    refreshFormContainer,
    onPhotoPreviewSelected
  }) {
    this.context = context;
    this.getRootNode = getRootNode;
    this.getFieldIds = getFieldIds;
    this.resolveFieldIdFromNode = resolveFieldIdFromNode;
    this.getDragHandlePresentation = getDragHandlePresentation;
    this.isSmallScreen = isSmallScreen;
    this.stopActiveEditing = stopActiveEditing;
    this.refreshFormContainer = refreshFormContainer;
    this.onPhotoPreviewSelected = onPhotoPreviewSelected;

    this.selectedFieldId = null;
    this.previewInsertionBeforeFieldId = null;
    this.draggingFieldId = null;
    this.dragHandleNodes = new Map();
    this.fieldNodes = new Map();
    this.fieldBaseStyles = new Map();
  }

  getSelectedFieldId() {
    return this.selectedFieldId;
  }

  getPreviewInsertionBeforeFieldId() {
    return this.previewInsertionBeforeFieldId;
  }

  getDraggingFieldId() {
    return this.draggingFieldId;
  }

  bindSelectionHandlers(container) {
    if (!container) return;

    const previousCapture = container.onEventCapture?.bind(container);
    container.onEventCapture = (event) => {
      const handledByPrevious = previousCapture?.(event);
      if (handledByPrevious) return true;

      if (event.type !== 'mousedown' && event.type !== 'click') {
        return false;
      }

      const fieldId = this.resolveFieldIdFromNode?.(event.target, {
        allowDeleteNode: true,
        allowHandleNode: true
      });
      if (!fieldId) return false;

      const targetId = event?.target?.id;
      const isPhotoPreviewNode =
        typeof targetId === 'string' && targetId.startsWith('photo-preview-');

      this.setSelectedField(fieldId);
      if (isPhotoPreviewNode) {
        this.onPhotoPreviewSelected?.(fieldId);
      }
      return false;
    };
  }

  setSelectedField(fieldId) {
    const nextFieldId = fieldId ?? null;
    if (this.selectedFieldId === nextFieldId) return;
    this.stopActiveEditing?.();
    this.selectedFieldId = nextFieldId;
    this.previewInsertionBeforeFieldId = null;
    this.refreshFormContainer?.();
  }

  setPreviewInsertion(fieldId) {
    const nextValue = fieldId ?? null;
    if (this.previewInsertionBeforeFieldId === nextValue) return;
    this.previewInsertionBeforeFieldId = nextValue;
    this.applyPreviewToDragHandles();
    this.applyPreviewToFields();
  }

  setDraggingState(isActive, sourceFieldId) {
    const nextDraggingFieldId = isActive ? (sourceFieldId ?? null) : null;
    if (this.draggingFieldId === nextDraggingFieldId) return;

    if (isActive) {
      this.stopActiveEditing?.();
    }

    this.draggingFieldId = nextDraggingFieldId;
    this.refreshFormContainer?.();
  }

  clearDragPreviewState() {
    this.previewInsertionBeforeFieldId = null;
    this.draggingFieldId = null;
  }

  resetAllState() {
    this.previewInsertionBeforeFieldId = null;
    this.selectedFieldId = null;
    this.draggingFieldId = null;
  }

  cacheNodes(container) {
    this.cacheDragHandleNodes(container);
    this.cacheFieldNodes(container);
  }

  applyPreviewVisuals() {
    this.applyPreviewToDragHandles();
    this.applyPreviewToFields();
  }

  cacheDragHandleNodes(container) {
    this.dragHandleNodes = new Map();
    if (!container) return;

    const walk = (node) => {
      if (!node) return;
      if (typeof node.id === 'string' && node.id.startsWith('drag-handle-')) {
        const fieldId = node.id.slice('drag-handle-'.length);
        this.dragHandleNodes.set(fieldId, node);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }

  applyPreviewToDragHandles() {
    if (!this.dragHandleNodes?.size) return;
    const smallScreen = this.isSmallScreen?.() ?? false;

    for (const [fieldId, node] of this.dragHandleNodes.entries()) {
      const presentation = this.getDragHandlePresentation?.(fieldId, { smallScreen }) ?? { text: '', style: {} };
      node.text = presentation.text;
      node.style = { ...presentation.style };
    }

    this.getRootNode?.()?.invalidate?.();
  }

  cacheFieldNodes(container) {
    this.fieldNodes = new Map();
    this.fieldBaseStyles = new Map();
    if (!container) return;

    const fieldIds = new Set(this.getFieldIds?.() || []);
    const walk = (node) => {
      if (!node) return;
      if (fieldIds.has(node.id)) {
        this.fieldNodes.set(node.id, node);
        this.fieldBaseStyles.set(node.id, { ...(node.style || {}) });
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }

  applyPreviewToFields() {
    if (!this.fieldNodes?.size) return;

    const hasPreview = Boolean(this.draggingFieldId && this.previewInsertionBeforeFieldId);
    for (const [fieldId, node] of this.fieldNodes.entries()) {
      const baseStyle = this.fieldBaseStyles.get(fieldId) || {};
      const isPreviewTarget = hasPreview && fieldId === this.previewInsertionBeforeFieldId;

      if (isPreviewTarget) {
        node.style = {
          ...baseStyle,
          borderColor: '#2563eb',
          focusBorderColor: '#2563eb',
          backgroundColor: '#dbeafe',
          radius: Math.max(6, Number(baseStyle.radius || 0))
        };
      } else {
        node.style = { ...baseStyle };
      }

      if (typeof node.setUIState === 'function') {
        node.setUIState({ selected: Boolean(isPreviewTarget) });
      }
    }

    this.getRootNode?.()?.invalidate?.();
  }
}