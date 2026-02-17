export function getPhotoSource(field) {
  return String(field?.src || field?.text || field?.value || '').trim();
}

export function isPhotoLikeField(field) {
  if (!field) return false;
  if (field.type === 'photo') return true;

  const probe = `${field.id || ''} ${field.label || ''} ${field.placeholder || ''}`.toLowerCase();
  const hasPhotoKeyword = /photo|image|picture|thumbnail/.test(probe);
  const hasUrlKeyword = /url|link/.test(probe);
  return field.type === 'input' && (hasPhotoKeyword || hasUrlKeyword);
}

export function isCopyCandidateField(field) {
  if (!field || field.type !== 'input') return false;
  const idText = String(field.id || '').toLowerCase();
  const labelText = String(field.label || field.text || '').toLowerCase();
  return /message/.test(idText) || /message/.test(labelText);
}