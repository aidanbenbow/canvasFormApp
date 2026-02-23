export function injectCopyButtonPlugin({
  shouldAddCopyButton,
  ensureCopyCommand,
  style = {}
} = {}) {
  return {
    name: 'copyButton',
    transform(field, context = {}) {
      const shouldAdd = (context.shouldAddCopyButton || shouldAddCopyButton)?.(field);
      if (!shouldAdd) {
        return field;
      }

      const copyCommand = (context.ensureCopyCommand || ensureCopyCommand)?.(field.id);
      const resolvedStyle = {
        ...style,
        ...(context.copyButtonStyle || {})
      };

      return [
        field,
        {
          type: 'button',
          id: `copy-${field.id}`,
          label: 'Copy',
          action: copyCommand,
          skipCollect: true,
          skipClear: true,
          style: resolvedStyle
        }
      ];
    }
  };
}