import { UIFieldContainer } from "./UiFieldContainer.js";
import { UIInput } from "./UiInput.js";
import { UiText } from "./UiText.js";
import { UIButton } from "./button.js";
import { UIScrollContainer } from "./scrollContainer.js";

export function createToolbarButton(label, onClick, context) {
    const { field, component } = createFieldComponent('button', context);
    
    field.label = label;
    field.onClick = onClick;
    component.label = label;
    component.onClick = onClick;
    return component;
  }

export function createFieldComponent(type, context) {
    
    const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
    const baseField = {
      id,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    };
  
    switch (type) {
      case 'text':
        return {
          field: baseField,
          component: createUIComponent(baseField, context)
        };
  
      case 'input':
        return {
          field: {
            ...baseField,
            placeholder: 'Enter text here...'
          },
          component: createUIComponent({
            ...baseField,
            placeholder: 'Enter text here...'
          }, context, { place: false })
        };
  
      case 'button':
        return {
          field: {
            ...baseField,
            label: 'Submit'
          },
          component: createUIComponent({
            ...baseField,
            label: 'Submit'
          }, context, { place: false })
        };
  
      default:
        throw new Error(`Unsupported field type: ${type}`);
    }
  }

export function createUIComponent(field, context) {
  const {
    id,
    type,
    label='',
    placeholder='',
    layout={},
    color,
    interactive = true,
    childSpacing = 10,
    defaultChildHeight = 50,
    onChange,
    onClick,
    
  } = field;
  const { textEditorController, uiStage } = context;
  
  let component;

  switch(type) {
    case 'button':
        component = new UIButton({
            id,
            label,
            color: color || '#007bff',
            onClick: onClick || (() => { console.log(`Button ${id} clicked`); }),
            context,
            layoutManager: uiStage.layoutManager,
            layoutRenderer: uiStage.layoutRenderer,
            });
            break;
    case 'text':
      
        component = new UiText({
            id,
            text: label,
            editor: textEditorController,
            context,
            layoutManager: uiStage.layoutManager,
            layoutRenderer: uiStage.layoutRenderer,
            });
            break;
     case 'input':
        component = new UIInput({
            id,
            editor: textEditorController,
            placeholder,
            label,
            context,
            layoutManager: uiStage.layoutManager,
            layoutRenderer: uiStage.layoutRenderer,
            });
        break;
        case 'container':
            component = new UIScrollContainer({
                id,
                context,
                layoutManager: uiStage.layoutManager,
                layoutRenderer: uiStage.layoutRenderer,
                childSpacing: childSpacing,
                defaultChildHeight: defaultChildHeight,
            });
            break;
            case 'fieldContainer':
                component = new UIFieldContainer({
                    id,
                    context,
                    layoutManager: uiStage.layoutManager,
                    layoutRenderer: uiStage.layoutRenderer,
                    bgColor: 'rgba(0,0,0,0.1)'
                });
                break;
        }  

  
    return component;
}