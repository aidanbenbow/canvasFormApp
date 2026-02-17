export function normalizeFields(formStructure) {
  if (!formStructure) return [];

  if (Array.isArray(formStructure)) {
    return formStructure.filter(Boolean);
  }

  if (Array.isArray(formStructure.fields)) {
    return formStructure.fields.filter(Boolean);
  }

  const values = Object.values(formStructure);
  if (!values.length) return [];

  const flattened = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      flattened.push(...value);
    } else if (value && typeof value === 'object' && value.type) {
      flattened.push(value);
    }
  }

  return flattened.filter(Boolean);
}