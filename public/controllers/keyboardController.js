export class keyboardController {
  constructor(pipeline,popup) {
    this.pipeline = pipeline;

    this.popupNode = popup
  }

  showKeyboard() {
    console.log("Showing keyboard popup", this.popupNode);
    this.popupNode.show();
    this.pipeline.invalidate();
  }

  hideKeyboard() {
    this.popupNode.hide();
    this.pipeline.invalidate();
  }
}