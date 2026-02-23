import { EDITOR_SELECTION_DELETE_BUTTON_STYLE } from './selectionControlsStyle.js';

export function injectEditorSelectionControlsPlugin({
  selectedFieldId,
  deleteFieldCommand,
  getDragHandlePresentation,
  deleteButtonStyle,
  smallScreen
} = {}) {
  return (fields) => {
    const next = [];

    for (const field of fields || []) {
      const isSelected = selectedFieldId && selectedFieldId === field?.id;

      if (isSelected) {
        next.push({
          type: 'text',
          id: `drag-handle-${field.id}`,
          ...getDragHandlePresentation?.(field.id, { smallScreen })
        });
      }

      next.push(field);

      if (isSelected) {
        next.push({
          type: 'button',
          id: `delete-${field.id}`,
          label: '✖',
          action: deleteFieldCommand,
          payload: { fieldId: field.id },
          style: {
            ...EDITOR_SELECTION_DELETE_BUTTON_STYLE,
            ...(deleteButtonStyle || {})
          },
          skipCollect: true,
          skipClear: true
        });
      }
    }

    return next;
  };
}