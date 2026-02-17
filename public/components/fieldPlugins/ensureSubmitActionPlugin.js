export function ensureSubmitActionPlugin({ action = 'form.submit', style } = {}) {
  return (fields) => {
    return (fields || []).map((field) => {
      if (field?.type !== 'button') return field;

      const nextField = {
        ...field,
        action: field.action || field.command || action
      };

      if (style) {
        nextField.style = {
          ...(field.style || {}),
          ...style
        };
      }

      return nextField;
    });
  };
}