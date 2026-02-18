export function stopCreateFormActiveEditing(context) {
  const editor = context?.textEditorController;
  if (!editor?.activeNode) return;
  editor.stopEditing();
}

export function focusCreateFormFieldInputForEditing({ context, rootNode, fieldId } = {}) {
  if (!fieldId) return;

  const activate = () => {
    const node = context?.fieldRegistry?.get(fieldId);
    if (!node || node.editable === false) return;

    context?.focusManager?.focus?.(node);
    context?.textEditorController?.startEditing?.(node);
    rootNode?.invalidate?.();
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(activate);
    return;
  }

  setTimeout(activate, 0);
}
