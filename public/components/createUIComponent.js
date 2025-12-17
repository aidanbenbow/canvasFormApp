import { UIFieldContainer } from "./UiFieldContainer.js";
import { UIInput } from "./UiInput.js";
import { UiText } from "./UiText.js";
import { UIButton } from "./button.js";
import { UIScrollContainer } from "./scrollContainer.js";


// export function createUIComponent(field, context) {
//   const {
//     id,
//     type,
//     label='',
//     placeholder='',
//     layout={},
//     color,
//     interactive = true,
//     childSpacing = 10,
//     defaultChildHeight = 50,
//     onChange,
//     onClick,
    
//   } = field;
//   const { textEditorController, uiStage } = context;
  
//   let component;

//   switch(type) {
//     case 'button':
//         component = new UIButton({
//             id,
//             label,
//             color: color || '#007bff',
//             onClick: onClick || (() => { console.log(`Button ${id} clicked`); }),
//             context,
//             layoutManager: uiStage.layoutManager,
//             layoutRenderer: uiStage.layoutRenderer,
//             });
//             break;
//     case 'text':
      
//         component = new UiText({
//             id,
//             text: label,
//             editor: textEditorController,
//             context,
//             layoutManager: uiStage.layoutManager,
//             layoutRenderer: uiStage.layoutRenderer,
//             });
//             break;
//      case 'input':
//         component = new UIInput({
//             id,
//             editor: textEditorController,
//             placeholder,
//             label,
//             context,
//             layoutManager: uiStage.layoutManager,
//             layoutRenderer: uiStage.layoutRenderer,
//             });
//         break;
//         case 'container':
//             component = new UIScrollContainer({
//                 id,
//                 context,
//                 layoutManager: uiStage.layoutManager,
//                 layoutRenderer: uiStage.layoutRenderer,
//                 childSpacing: childSpacing,
//                 defaultChildHeight: defaultChildHeight,
//             });
//             break;
//             case 'fieldContainer':
//                 component = new UIFieldContainer({
//                     id,
//                     context,
//                     layoutManager: uiStage.layoutManager,
//                     layoutRenderer: uiStage.layoutRenderer,
//                     bgColor: 'rgba(0,0,0,0.1)'
//                 });
//                 break;
//         }  

  
//     return component;
// }

const componentRegistry = {
  button: UIButton,
  text: UiText,
  input: UIInput,
  container: UIScrollContainer,
  fieldContainer: UIFieldContainer
};

export function createUIComponent(def, context) {

  const { type, id } = def;
  const ComponentClass = componentRegistry[type];
  if (!ComponentClass) throw new Error(`Unknown component type: ${type}`);
  return new ComponentClass({ id, ...def, context });
}