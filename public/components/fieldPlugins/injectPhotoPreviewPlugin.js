export function injectPhotoPreviewPlugin({
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction = 'photo.preview.saveBrightness',
  previewStyle = {},
  placeholder = 'Enter photo URL...'
} = {}) {
  return {
    name: 'photoPreview',
    transform(field, context = {}) {
      const isPhotoField = (context.isPhotoLikeField || isPhotoLikeField)?.(field);
      if (!isPhotoField) {
        return field;
      }

      const resolveSource = context.getPhotoSource || getPhotoSource;
      const source = resolveSource?.(field) ?? '';
      const brightnessAction = context.saveBrightnessAction || saveBrightnessAction;
      const placeholderText = field?.placeholder || context.placeholder || placeholder;
      const resolvedPreviewStyle = {
        ...previewStyle,
        ...(context.previewStyle || {})
      };

      return [
        {
          ...field,
          type: 'input',
          value: source,
          placeholder: placeholderText
        },
        {
          type: 'photo',
          id: `photo-preview-${field.id}`,
          src: source,
          brightness: Number(field?.brightness ?? 100),
          style: {
            fillWidth: true,
            borderColor: '#93c5fd',
            backgroundColor: '#eff6ff',
            ...resolvedPreviewStyle
          }
        },
        {
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
        },
        {
          type: 'button',
          id: `photo-brightness-save-${field.id}`,
          label: 'Save Brightness',
          action: brightnessAction,
          payload: { fieldId: field.id },
          visible: false,
          hitTestable: false,
          skipCollect: true,
          skipClear: true
        }
      ];
    }
  };
}