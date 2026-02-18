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
    this.nodeOnChangeBindings = new WeakMap();
  }

  bindEditableNodes(container) {
    if (!container) return;

    const fields = this.getFields?.() || [];
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    const walk = (node) => {
      if (!node) return;
      const field = fieldMap.get(node.id);
      if (field && node.editable) {
        let onChangeBinding = this.nodeOnChangeBindings.get(node);
        if (!onChangeBinding) {
          onChangeBinding = {
            field: null,
            originalOnChange: node.onChange,
            wrappedOnChange: null
          };

          onChangeBinding.wrappedOnChange = (value) => {
            onChangeBinding.originalOnChange?.(value);

            const activeField = onChangeBinding.field;
            if (!activeField) return;

            const previousSource = String(this.getPhotoSource?.(activeField) ?? '').trim();
            activeField.text = value;
            if (this.isPhotoLikeField?.(activeField)) {
              activeField.src = value;
              activeField.value = value;
              const nextSource = String(this.getPhotoSource?.(activeField) ?? value ?? '').trim();
              this.updatePhotoPreview?.(activeField.id, nextSource);
              if (!previousSource && nextSource) {
                this.onPhotoPreviewCreated?.(activeField.id);
              }
            }
            if (activeField.label !== undefined) {
              activeField.label = value;
            }
          };

          this.nodeOnChangeBindings.set(node, onChangeBinding);
        }

        onChangeBinding.field = field;
        node.onChange = onChangeBinding.wrappedOnChange;
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(container);
  }
}