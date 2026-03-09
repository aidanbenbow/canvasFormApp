export function buildDefaultCreateFormField(type) {
  const resolvedType = String(type || '').trim() || 'input';

  const field = {
    id: `${resolvedType}-${Date.now()}`,
    type: resolvedType,
    label: getDefaultLabel(resolvedType),
    placeholder: shouldUsePlaceholder(resolvedType) ? 'Enter text here...' : undefined
  };

  if (resolvedType === 'label') {
    field.text = field.label;
  }

  if (resolvedType === 'dropDown') {
    field.placeholder = 'Select option';
    field.options = [
      {
        label: 'Other',
        value: 'other'
      }
    ];
  }

  return field;
}

function getDefaultLabel(type) {
  if (type === 'text') return 'New Title';
  if (type === 'label') return 'New Label';
  if (type === 'input') return 'New Input';
  if (type === 'dropDown') return 'New Dropdown';
  if (type === 'photo') return 'Photo URL';
  return 'submit';
}

function shouldUsePlaceholder(type) {
  return type === 'input' || type === 'photo' || type === 'dropDown';
}
