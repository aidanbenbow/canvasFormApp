import { EDITOR_SELECTION_DELETE_BUTTON_STYLE } from './selectionControlsStyle.js';

export function injectEditorSelectionControlsPlugin({
  selectedFieldId,
  deleteFieldCommand,
  getDragHandlePresentation,
  deleteButtonStyle,
  smallScreen
} = {}) {
  return {
    name: 'selectionControls',
    transform(field, context = {}) {
      const activeSelectedFieldId = context.selectedFieldId ?? selectedFieldId;
      const activeDeleteFieldCommand = context.deleteFieldCommand || deleteFieldCommand;
      const activeGetDragHandlePresentation = context.getDragHandlePresentation || getDragHandlePresentation;
      const activeSmallScreen = context.smallScreen ?? smallScreen;
      const activeDeleteButtonStyle = {
        ...(deleteButtonStyle || {}),
        ...(context.deleteButtonStyle || {})
      };
      const isSelected = activeSelectedFieldId && activeSelectedFieldId === field?.id;

      if (!isSelected) {
        return field;
      }

      return [
        {
          type: 'text',
          id: `drag-handle-${field.id}`,
          ...activeGetDragHandlePresentation?.(field.id, { smallScreen: activeSmallScreen })
        },
        field,
        {
          type: 'button',
          id: `delete-${field.id}`,
          label: '✖',
          action: activeDeleteFieldCommand,
          payload: { fieldId: field.id },
          style: {
            ...EDITOR_SELECTION_DELETE_BUTTON_STYLE,
            ...activeDeleteButtonStyle
          },
          skipCollect: true,
          skipClear: true
        }
      ];
    }
  };
}