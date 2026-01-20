export class keyboardController {
  constructor(pipeline,popup) {
    this.pipeline = pipeline;

    this.popupNode = popup
  }

  showKeyboard() {
    this.popupNode.show();
    this.pipeline.invalidate();
  }

  hideKeyboard() {
    this.popupNode.hide();
    this.pipeline.invalidate();
  }
}