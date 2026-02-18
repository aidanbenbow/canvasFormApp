export function resolveCreateFormFieldIdFromNode({
  node,
  fields,
  allowDeleteNode = false,
  allowHandleNode = true
} = {}) {
  const fieldIds = new Set((fields || []).map((field) => field?.id).filter(Boolean));
  let current = node;

  while (current) {
    const id = current.id;

    if (allowDeleteNode && typeof id === 'string' && id.startsWith('delete-')) {
      const parsed = id.slice('delete-'.length);
      if (fieldIds.has(parsed)) return parsed;
    }

    if (allowHandleNode && typeof id === 'string' && id.startsWith('drag-handle-')) {
      const parsed = id.slice('drag-handle-'.length);
      if (fieldIds.has(parsed)) return parsed;
    }

    if (typeof id === 'string' && id.startsWith('photo-preview-')) {
      const parsed = id.slice('photo-preview-'.length);
      if (fieldIds.has(parsed)) return parsed;
    }

    if (fieldIds.has(id)) {
      return id;
    }

    current = current.parent;
  }

  return null;
}
