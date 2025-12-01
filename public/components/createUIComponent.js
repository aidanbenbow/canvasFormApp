import { UIButton } from "./button.js";
import {  LabeledInput } from "./labeledInput.js";
import { UIScrollContainer } from "./scrollContainer.js";
import { UIText } from "./text.js";


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

export function createUIComponent(field, context, {place = true} = {}) {
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
  const { textEditorController, uiStage, pluginRegistry } = context;
  
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
        component = new UIText({
            id,
            text: label,
            fieldRef: field,
            editor: textEditorController,
            context,
            layoutManager: uiStage.layoutManager,
            layoutRenderer: uiStage.layoutRenderer,
            onClick: onClick || (() => { console.log(`Text ${id} clicked`); }),
            });
            break;
     case 'input':
        component = new LabeledInput({
            id,
            editor: textEditorController,
            context,
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
                context,
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