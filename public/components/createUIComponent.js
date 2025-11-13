import { UIButton } from "./button.js";
import {  LabeledInput } from "./labeledInput.js";
import { UIScrollContainer } from "./scrollContainer.js";
import { UIText } from "./text.js";

export function createUIComponent(field, context, {place = true} = {}) {
  const {
    id,
    type,
    label='',
    placeholder='',
    layout={},
    interactive = true,
    childSpacing = 10,
    defaultChildHeight = 50,
    onChange,
    onClick,
    
  } = field;
  const { textEditorController, uiStage, pluginRegistry } = context;
  
  let component;

  switch(type) {
    case 'button':
        component = new UIButton({
            id,
            label,
            onClick: onClick || (() => { console.log(`Button ${id} clicked`); }),
            });
            break;
    case 'text':
        component = new UIText({
            id,
            text: label,
            editor: textEditorController,
            });
            break;
     case 'input':
        component = new LabeledInput({
            id,
            editor: textEditorController,
            layoutManager: uiStage.layoutManager,
            layoutRenderer: uiStage.layoutRenderer,
            label,
            interactive,
            onChange: onChange || ((value) => { console.log(`Input ${id} changed to:`, value); }),
        });
        break;
        case 'container':
            component = new UIScrollContainer({
                id,
                layoutManager: uiStage.layoutManager,
                layoutRenderer: uiStage.layoutRenderer,
                childSpaceing: childSpacing,
                defaultChildHeight: defaultChildHeight,
            });
            break;
        }  

    if (place) {
        uiStage.layoutManager.place({ id, ...layout });
    }
    return component;
}