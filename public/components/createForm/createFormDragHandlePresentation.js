export function getCreateFormDragHandlePresentation({
  fieldId,
  smallScreen,
  previewInsertionBeforeFieldId
} = {}) {
  const isPreviewTarget = previewInsertionBeforeFieldId === fieldId;

  if (isPreviewTarget) {
    return {
      text: '',
      style: {
        color: '#0078ff',
        backgroundColor: '#0078ff',
        borderColor: '#005fcc',
        align: 'center',
        font: smallScreen ? '14px sans-serif' : '8px sans-serif',
        radius: smallScreen ? 10 : 6,
        paddingX: 0,
        paddingY: 0
      }
    };
  }

  return {
    text: '↕ Drag to reorder',
    style: {
      color: '#1f2937',
      backgroundColor: '#e5e7eb',
      borderColor: '#9ca3af',
      align: 'center',
      ...(smallScreen
        ? {
            font: '30px sans-serif',
            paddingX: 18,
            paddingY: 14,
            radius: 8
          }
        : {
            font: '18px sans-serif',
            paddingX: 10,
            paddingY: 6,
            radius: 4
          })
    }
  };
}
