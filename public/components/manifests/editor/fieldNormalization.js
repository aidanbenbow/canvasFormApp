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
  return (fields || []).map((field) => normalizeFieldForMode(field, { mode }));
}

export function decorateFieldsForSelection(fields, { selectedFieldId } = {}) {
  return (fields || []).map((field) => {
    const def = structuredClone(field);
    const isSelected = selectedFieldId === def.id;

    if ((def.type === 'text' || def.type === 'label') && isSelected) {
      def.editable = true;
    }

    if (def.type === 'fieldContainer' && isSelected && Array.isArray(def.children)) {
      def.children = def.children.map((child) => makeChildEditableForSelectedGroup(child));
    }

    const selectionStyle = {
      ...(def.style || {}),
      borderColor: isSelected
        ? EDITOR_FIELD_DECORATION.selection.borderColor
        : (def.style?.borderColor || EDITOR_FIELD_DECORATION.selection.defaultBorderColor)
    };

    if (def.type === 'fieldContainer') {
      def.style = {
        ...selectionStyle,
        border: {
          color: selectionStyle.borderColor,
          width: isSelected ? 2 : 1
        },
        backgroundColor: isSelected ? '#eef6ff' : def.style?.backgroundColor,
        paddingX: def.style?.paddingX ?? 8,
        paddingY: def.style?.paddingY ?? 8
      };
    } else {
      def.style = selectionStyle;
    }

    return def;
  });
}

export function decorateFieldsForDragging(fields, { draggingFieldId } = {}) {
  return (fields || []).map((field) => {
    const def = structuredClone(field);
    const isDragging = draggingFieldId === def.id;

    if (def.type === 'fieldContainer') {
      def.style = {
        ...(def.style || {}),
        borderColor: isDragging
          ? '#2563eb'
          : (def.style?.borderColor || EDITOR_FIELD_DECORATION.selection.defaultBorderColor),
        border: {
          ...(def.style?.border || {}),
          color: isDragging
            ? '#2563eb'
            : (def.style?.border?.color || def.style?.borderColor || EDITOR_FIELD_DECORATION.selection.defaultBorderColor),
          width: isDragging ? 2 : (def.style?.border?.width ?? 1)
        },
        backgroundColor: isDragging
          ? EDITOR_FIELD_DECORATION.dragging.backgroundColor
          : def.style?.backgroundColor,
        opacity: isDragging
          ? EDITOR_FIELD_DECORATION.dragging.opacity
          : (def.style?.opacity ?? EDITOR_FIELD_DECORATION.dragging.defaultOpacity)
      };
    } else {
      def.style = {
        ...(def.style || {}),
        backgroundColor: isDragging
          ? EDITOR_FIELD_DECORATION.dragging.backgroundColor
          : def.style?.backgroundColor,
        opacity: isDragging
          ? EDITOR_FIELD_DECORATION.dragging.opacity
          : (def.style?.opacity ?? EDITOR_FIELD_DECORATION.dragging.defaultOpacity)
      };
    }

    return def;
  });
}

export function normalizeEditorFields(fields, { mode, selectedFieldId, draggingFieldId } = {}) {
  const modeNormalized = normalizeFieldsForMode(fields, { mode });
  const selectionDecorated = decorateFieldsForSelection(modeNormalized, { selectedFieldId });
  return decorateFieldsForDragging(selectionDecorated, { draggingFieldId });
}

function normalizeFieldForMode(field, { mode } = {}) {
  const def = structuredClone(field);

  if (def.type === 'fieldGroup') {
    const children = Array.isArray(def.children)
      ? def.children.map((child) => normalizeFieldForMode(child, { mode }))
      : [];

    return {
      id: def.id,
      type: 'fieldContainer',
      layout: 'vertical',
      style: {
        ...(def.style || {})
      },
      children
    };
  }

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
}

function makeChildEditableForSelectedGroup(field) {
  const child = structuredClone(field);

  if (child.type === 'label' || child.type === 'text') {
    child.editable = true;
  }

  if (Array.isArray(child.children)) {
    child.children = child.children.map((entry) => makeChildEditableForSelectedGroup(entry));
  }

  return child;
}