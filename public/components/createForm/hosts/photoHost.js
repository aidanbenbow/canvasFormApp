import { getPhotoSource, isPhotoLikeField } from '../../../utils/fieldGuards.js';

export class PhotoHost {
  getPhotoSource(field) {
    return getPhotoSource(field);
  }

  isPhotoLikeField(field) {
    return isPhotoLikeField(field);
  }
}
