export function injectCopyButtonPlugin({
  shouldAddCopyButton,
  ensureCopyCommand,
  style = {}
} = {}) {
  return (fields) => {
    const next = [];

    for (const field of fields || []) {
      next.push(field);
      if (!shouldAddCopyButton?.(field)) continue;

      const copyCommand = ensureCopyCommand?.(field.id);
      next.push({
        type: 'button',
        id: `copy-${field.id}`,
        label: 'Copy',
        action: copyCommand,
        skipCollect: true,
        skipClear: true,
        style
      });
    }

    return next;
  };
}