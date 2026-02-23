export function ensureSubmitActionPlugin({ action = 'form.submit', style } = {}) {
  return {
    name: 'submitAction',
    transform(field, context = {}) {
      if (field?.type !== 'button') return field;

      const resolvedAction = context.submitAction || action;
      const resolvedStyle = context.submitStyle || style;
      const nextField = {
        ...field,
        action: field.action || field.command || resolvedAction
      };

      if (resolvedStyle) {
        nextField.style = {
          ...(field.style || {}),
          ...resolvedStyle
        };
      }

      return nextField;
    }
  };
}