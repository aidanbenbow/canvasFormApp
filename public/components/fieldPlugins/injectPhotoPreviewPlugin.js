export function injectPhotoPreviewPlugin({
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction = 'photo.preview.saveBrightness',
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
        brightness: Number(field?.brightness ?? 100),
        style: {
          fillWidth: true,
          borderColor: '#93c5fd',
          backgroundColor: '#eff6ff',
          ...previewStyle
        }
      });

      next.push({
        type: 'slider',
        id: `photo-brightness-${field.id}`,
        label: 'Brightness',
        min: 40,
        max: 200,
        step: 1,
        value: Number(field?.brightness ?? 100),
        visible: false,
        hitTestable: false,
        style: {
          fillWidth: true
        }
      });

      next.push({
        type: 'button',
        id: `photo-brightness-save-${field.id}`,
        label: 'Save Brightness',
        action: saveBrightnessAction,
        payload: { fieldId: field.id },
        visible: false,
        hitTestable: false,
        skipCollect: true,
        skipClear: true
      });
    }

    return next;
  };
}