import { EventCapturePipeline } from '../events/eventCapturePipeline.js';

export class FormBuilderInteractionController {
  constructor({
    context,
    editorState,
    getRootNode,
    getFieldIds,
    resolveFieldIdFromNode,
    getDragHandlePresentation,
    isSmallScreen,
    stopActiveEditing,
    refreshFormContainer
  }) {
    this.context = context;
    this.editorState = editorState;
    this.getRootNode = getRootNode;
    this.getFieldIds = getFieldIds;
    this.resolveFieldIdFromNode = resolveFieldIdFromNode;
    this.getDragHandlePresentation = getDragHandlePresentation;
    this.isSmallScreen = isSmallScreen;
    this.stopActiveEditing = stopActiveEditing;
    this.refreshFormContainer = refreshFormContainer;

    this.editorStateSnapshot = this.editorState?.getSnapshot?.() || {
      mode: 'create',
      selectedFieldId: null,
      draggingFieldId: null,
      previewInsertionBeforeFieldId: null
    };
    this.unsubscribeEditorState = this.editorState?.subscribe?.((nextState) => {
      this.editorStateSnapshot = nextState;
    });

    this.dragHandleNodes = new Map();
    this.fieldNodes = new Map();
    this.fieldBaseStyles = new Map();
    this.selectionCaptureDisposers = new WeakMap();
    this.activeSelectionDisposers = new Set();
  }

  getSelectedFieldId() {
    return this.editorStateSnapshot.selectedFieldId;
  }

  getPreviewInsertionBeforeFieldId() {
    return this.editorStateSnapshot.previewInsertionBeforeFieldId;
  }

  getDraggingFieldId() {
    return this.editorStateSnapshot.draggingFieldId;
  }

  bindSelectionHandlers(container) {
    if (!container) return;
    if (this.selectionCaptureDisposers.has(container)) return;

    const pipeline = EventCapturePipeline.forContainer(container);
    if (!pipeline) return;

    const disposeCapture = pipeline.use((event) => {
      const fieldId = this.resolveFieldIdFromNode?.(event.target, {
        allowDeleteNode: true,
        allowHandleNode: true
      });
      if (!fieldId) return false;

      this.setSelectedField(fieldId);
      return false;
    }, {
      types: ['mousedown', 'click'],
      priority: 10
    });

    this.selectionCaptureDisposers.set(container, disposeCapture);
    this.activeSelectionDisposers.add(disposeCapture);
  }

  /**
   * Selection is the re-render trigger for the builder container.
   * Callers should not invoke refresh separately after selecting,
   * because this method already calls refreshFormContainer.
   */
  setSelectedField(fieldId) {
    const nextFieldId = fieldId ?? null;
    if (this.getSelectedFieldId() === nextFieldId) return;
    this.stopActiveEditing?.();
    this.editorState?.set({
      selectedFieldId: nextFieldId,
      previewInsertionBeforeFieldId: null
    });
    this.refreshFormContainer?.();
  }

  resetAllState() {
    this.editorState?.set({
      selectedFieldId: null,
      previewInsertionBeforeFieldId: null,
      draggingFieldId: null
    });
  }

  dispose() {
    for (const disposeCapture of this.activeSelectionDisposers) {
      disposeCapture?.();
    }
    this.activeSelectionDisposers.clear();
    this.selectionCaptureDisposers = new WeakMap();

    this.unsubscribeEditorState?.();
    this.unsubscribeEditorState = null;
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

    const draggingFieldId = this.getDraggingFieldId();
    const previewInsertionBeforeFieldId = this.getPreviewInsertionBeforeFieldId();
    const hasPreview = Boolean(draggingFieldId && previewInsertionBeforeFieldId);
    for (const [fieldId, node] of this.fieldNodes.entries()) {
      const baseStyle = this.fieldBaseStyles.get(fieldId) || {};
      const isPreviewTarget = hasPreview && fieldId === previewInsertionBeforeFieldId;

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