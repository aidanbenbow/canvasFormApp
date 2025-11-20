import { UIElement } from "./UiElement.js";
import { createUIComponent } from "./createUIComponent.js";


export class ManifestUI extends UIElement{
    buildContainersFromManifest(manifest) {
        manifest.forEach(({ idSuffix, type, layout, scroll, assignTo }) => {
          const component = createUIComponent({
            id: `${this.id}-${idSuffix}`,
            type,
            layout
          }, this.context);
    
          if (scroll) component.initializeScroll();
          this.addChild(component);
          if (assignTo) this[assignTo] = component;
        });
      }
    
      buildChildrenFromManifest(manifest, targetContainer) {
        manifest.forEach(def => {
          const component = createUIComponent(def, this.context);
          targetContainer.addChild(component);
        });
      }

      buildFormFromManifest(manifest, targetContainer, { onSubmit }) {
        const inputBoxes = new Map();
      
        manifest.formStructure.fields.forEach(field => {
          const component = createUIComponent(field, this.context);
      
          if (field.type === 'input') {
            inputBoxes.set(field.label, component);
          }
      
          if (field.type === 'button') {
            component.onClick = () => {
              const responseData = {
                formId: manifest.id,
                user: manifest.user || 'anonymous',
                responses: {}
              };
              inputBoxes.forEach((inputBox, label) => {
                responseData.responses[label] = inputBox.getValue();
              });
              onSubmit?.(responseData);
            };
          }
      
          targetContainer.addChild(component);
        });
      
        return inputBoxes;
      }
    
}