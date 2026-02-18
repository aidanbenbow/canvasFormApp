export class FormBuilderFieldBindingController {
  constructor({
    getFields,
    isPhotoLikeField,
    getPhotoSource,
    updatePhotoPreview,
    onPhotoPreviewCreated
  }) {
    this.getFields = getFields;
    this.isPhotoLikeField = isPhotoLikeField;
    this.getPhotoSource = getPhotoSource;
    this.updatePhotoPreview = updatePhotoPreview;
    this.onPhotoPreviewCreated = onPhotoPreviewCreated;
  }

  bindEditableNodes(container) {
    if (!container) return;

    const fields = this.getFields?.() || [];
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    const walk = (node) => {
      if (!node) return;
      const field = fieldMap.get(node.id);
      if (field && node.editable) {
        node.onChange = (value) => {
          const previousSource = String(this.getPhotoSource?.(field) ?? '').trim();
          field.text = value;
          if (this.isPhotoLikeField?.(field)) {
            field.src = value;
            field.value = value;
            const nextSource = String(this.getPhotoSource?.(field) ?? value ?? '').trim();
            this.updatePhotoPreview?.(field.id, nextSource);
            if (!previousSource && nextSource) {
              this.onPhotoPreviewCreated?.(field.id);
            }
          }
          if (field.label !== undefined) {
            field.label = value;
          }
        };
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }
}