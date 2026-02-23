export const EDITOR_FIELD_DECORATION = {
  selection: {
    borderColor: '#0078ff',
    defaultBorderColor: '#ccc'
  },
  dragging: {
    backgroundColor: '#e0f2fe',
    opacity: 0.8,
    defaultOpacity: 1
  }
};

export function normalizeFieldsForMode(fields, { mode } = {}) {
  return (fields || []).map((field) => {
    const def = structuredClone(field);

    if (def.type === 'text' && def.text == null) {
      def.text = def.label || 'Text';
    }

    if (def.type === 'button') {
      def.label = def.label || 'Submit';
      delete def.action;
      delete def.command;
    }

    if (mode === 'edit' && (def.type === 'input' || def.type === 'photo')) {
      def.editable = false;
    }

    return def;
  });
}

export function decorateFieldsForSelection(fields, { selectedFieldId } = {}) {
  return (fields || []).map((field) => {
    const def = structuredClone(field);
    const isSelected = selectedFieldId === def.id;

    if ((def.type === 'text' || def.type === 'label') && isSelected) {
      def.editable = true;
    }

    def.style = {
      ...(def.style || {}),
      borderColor: isSelected
        ? EDITOR_FIELD_DECORATION.selection.borderColor
        : (def.style?.borderColor || EDITOR_FIELD_DECORATION.selection.defaultBorderColor)
    };

    return def;
  });
}

export function decorateFieldsForDragging(fields, { draggingFieldId } = {}) {
  return (fields || []).map((field) => {
    const def = structuredClone(field);
    const isDragging = draggingFieldId === def.id;

    def.style = {
      ...(def.style || {}),
      backgroundColor: isDragging
        ? EDITOR_FIELD_DECORATION.dragging.backgroundColor
        : def.style?.backgroundColor,
      opacity: isDragging
        ? EDITOR_FIELD_DECORATION.dragging.opacity
        : (def.style?.opacity ?? EDITOR_FIELD_DECORATION.dragging.defaultOpacity)
    };

    return def;
  });
}

export function normalizeEditorFields(fields, { mode, selectedFieldId, draggingFieldId } = {}) {
  const modeNormalized = normalizeFieldsForMode(fields, { mode });
  const selectionDecorated = decorateFieldsForSelection(modeNormalized, { selectedFieldId });
  return decorateFieldsForDragging(selectionDecorated, { draggingFieldId });
}