export function bindCreateFormPhotoPreviewHandlers({
  photoPreviewController,
  fields,
  isPhotoLikeField,
  getPhotoSource
} = {}) {
  if (!photoPreviewController || !Array.isArray(fields)) return;

  const entries = fields.filter((field) => isPhotoLikeField?.(field));

  photoPreviewController.bindPhotoFields(entries, {
    isPhotoLikeField: (field) => isPhotoLikeField?.(field),
    getPhotoSource: (field) => getPhotoSource?.(field)
  });
}
