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
            const fullDef = {
                ...def,
                id: `${this.id}-${def.idSuffix || def.id || Math.random().toString(36).substr(2, 9)}`
            };
          const component = createUIComponent(fullDef, this.context);
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
      displayAllForms(forms, targetContainer, { onSubmit }) {
        forms.forEach(form => {
          this.buildFormFromManifest(form, targetContainer, { onSubmit });
        });
      }
      displayFormsLabels(forms, targetContainer, { onSelectForm }) {
        forms.forEach(form => {
          const button = createUIComponent({
            id: `${this.id}-formButton-${form.id}`,
            type: 'button',
            label: form.formStructure.title || `Form ${form.id}`,
            onClick: () => onSelectForm?.(form)
          }, this.context, { place: false });
          targetContainer.addChild(button);
        });
      }
    
}