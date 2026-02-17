export function injectPhotoPreviewPlugin({
  isPhotoLikeField,
  getPhotoSource,
  previewStyle = {},
  placeholder = 'Enter photo URL...'
} = {}) {
  return (fields) => {
    const next = [];

    for (const field of fields || []) {
      if (!isPhotoLikeField?.(field)) {
        next.push(field);
        continue;
      }

      const source = getPhotoSource?.(field) ?? '';
      next.push({
        ...field,
        type: 'input',
        value: source,
        placeholder: field?.placeholder || placeholder
      });

      next.push({
        type: 'photo',
        id: `photo-preview-${field.id}`,
        src: source,
        style: {
          fillWidth: true,
          borderColor: '#93c5fd',
          backgroundColor: '#eff6ff',
          ...previewStyle
        }
      });
    }

    return next;
  };
}