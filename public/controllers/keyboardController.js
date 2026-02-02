export class keyboardController {
  constructor(pipeline,popup) {
    this.pipeline = pipeline;

    this.popupNode = popup.popupLayer
  
  }

  showKeyboard() {
   console.log(this.popupNode)
    this.popupNode.show();
    this.pipeline.invalidate();
  }

  hideKeyboard() {
    this.popupNode.hide();
    this.pipeline.invalidate();
  }
}