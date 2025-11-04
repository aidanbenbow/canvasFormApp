import { UIElement } from "./UiElement.js";
import { UIButton } from "./button.js";
import { UIInputBox } from "./inputBox.js";

export class PlaceholderPromptOverlay extends UIElement {
    constructor({ targetBox, layoutManager, layoutRenderer, context, onConfirm }) {
      super({ id: 'placeholderPrompt', layoutManager, layoutRenderer });
      this.targetBox = targetBox;
      this.context = context;
      this.onConfirm = onConfirm;
  
      layoutManager.place({ id: 'promptInput', x: 100, y: 100, width: 300, height: 40 });
      layoutManager.place({ id: 'confirmButton', x: 500, y: 100, width: 100, height: 40 });
  
      const input = new UIInputBox({
        id: 'promptInput',
        editorController: context.textEditorController,
        placeholder: 'Enter new placeholder',
        interactive: true
      });
  
UIElement.setFocus(input);
context.textEditorController.startEditing(input, 'text');

      const confirm = new UIButton({
        id: 'confirmButton',
        label: 'Apply',
        onClick: () => {
            const newText = input.getText().trim();
console.log("New placeholder text:", newText);
            if (newText) {
              this.onConfirm(newText);
              this.context.uiStage.overlayRoot = null;
              this.context.pipeline.invalidate();
            }
          }
          
      });
  
      this.addChild(input);
      this.addChild(confirm);
    }
  
    registerHitRegions(hitRegistry) {
      hitRegistry.registerPluginHits(this, {
        promptInput: 'input',
        confirmButton: 'button'
      });
    }
  }
  