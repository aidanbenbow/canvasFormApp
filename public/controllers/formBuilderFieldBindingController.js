export class FormBuilderFieldBindingController {
  constructor({
    getFields,
    isPhotoLikeField,
    getPhotoSource,
    updatePhotoPreview
  }) {
    this.getFields = getFields;
    this.isPhotoLikeField = isPhotoLikeField;
    this.getPhotoSource = getPhotoSource;
    this.updatePhotoPreview = updatePhotoPreview;
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
          field.text = value;
          if (this.isPhotoLikeField?.(field)) {
            field.src = value;
            field.value = value;
            this.updatePhotoPreview?.(field.id, this.getPhotoSource?.(field) ?? value);
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