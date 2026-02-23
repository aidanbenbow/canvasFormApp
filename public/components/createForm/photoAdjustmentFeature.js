import { PhotoPreviewController } from '../../controllers/photoPreviewController.js';
import { bindCreateFormPhotoPreviewHandlers } from './createFormPhotoPreviewBinder.js';

export class PhotoAdjustmentFeature {
  constructor({
    context,
    getFieldById,
    onBrightnessCommitted,
    onSelectField,
    onFocusField,
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction
  } = {}) {
    this.onSelectField = onSelectField;
    this.onFocusField = onFocusField;
    this.isPhotoLikeField = isPhotoLikeField;
    this.getPhotoSource = getPhotoSource;
    this.saveBrightnessAction = saveBrightnessAction;

    this.photoPreviewController = new PhotoPreviewController({
      context,
      onBrightnessCommitted,
      getFieldById
    });
  }

  getSaveBrightnessAction() {
    return this.saveBrightnessAction;
  }

  handleSaveBrightness(fieldId) {
    this.photoPreviewController.commitBrightness(fieldId);
  }

  updatePreviewForField(fieldId, source) {
    this.photoPreviewController.updatePreviewForField(fieldId, source);
  }

  onPhotoPreviewCreated(fieldId) {
    this.onSelectField?.(fieldId);
  }

  onPhotoPreviewSelected(fieldId) {
    this.photoPreviewController.showBrightnessControl(fieldId);
    this.onFocusField?.(fieldId);
  }

  bind(fields) {
    bindCreateFormPhotoPreviewHandlers({
      photoPreviewController: this.photoPreviewController,
      fields,
      isPhotoLikeField: (field) => this.isPhotoLikeField?.(field),
      getPhotoSource: (field) => this.getPhotoSource?.(field)
    });
  }
}