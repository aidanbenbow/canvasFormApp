
import { UIElement } from "./UiElement.js";
import { UIFieldContainer } from "./UiFieldContainer.js";

import { createUIComponent } from "../components/createUIComponent.js";


export class UIElementFactory {
  constructor({ context,  }) {
    this.context = context;
    // this.layoutManager = layoutManager;
    // this.layoutRenderer = layoutRenderer;
  }

  // -------------------------------
  // Containers
  // -------------------------------
  createContainers(manifest) {
    return manifest.map(({ idSuffix, type, assignTo }) => {
      const component = createUIComponent(
        { id: `ui-${idSuffix}`, type },
        this.context
      );
      return { component, assignTo };
    });
  }

  
  // -------------------------------
  // Buttons
  // -------------------------------
  createButtons(manifest, screenRef) {
    return manifest.map(def => {
      const id = `ui-${def.idSuffix}`;
      const btn = createUIComponent({ ...def, id }, this.context);
      if (def.action) btn.onClick = () => def.action(screenRef);
      return btn;
    });
  }

  // -------------------------------
  // Forms
  // -------------------------------
  createForm(manifest, { onSubmit, onDelete } = {}) {
    if (!manifest?.formStructure?.fields?.length) {
      console.warn("Invalid manifest passed to createForm:", manifest);
      return { inputBoxes: new Map(), containers: [] };
    }

    const inputBoxes = new Map();
    const containers = [];

    manifest.formStructure.fields.forEach(field => {
      const component = createUIComponent(field, this.context, { place: false });

      if (field.type === "input") inputBoxes.set(field.label, component);

      if (field.type === "button") {
        component.onClick = () => {
          const responses = {};
          inputBoxes.forEach((input, label) => (responses[label] = input.getValue()));
          onSubmit?.({ formId: manifest.id, user: manifest.user || "anonymous", responses });
        };
      }

      const fieldContainer = new UIFieldContainer({
        id: `field-container-${field.id}`,
        context: this.context,
        layoutManager: this.layoutManager,
        layoutRenderer: this.layoutRenderer,
        bgColor: "rgba(0,0,0,0.2)"
      });

      fieldContainer.addChild(component);

      // Optional: delete button
      if (onDelete) {
        const deleteBtn = createUIComponent({
          id: `delete-btn-${field.id}`,
          type: "button",
          label: "Delete",
          color: "#dc3545",
          onClick: () => {
            onDelete(field.id);
            fieldContainer.removeChild(component);
            fieldContainer.removeChild(deleteBtn);
          }
        }, this.context);
        fieldContainer.addChild(deleteBtn);
      }

      containers.push(fieldContainer);
    });

    return { inputBoxes, containers };
  }

  // -------------------------------
  // Forms labels (summary buttons)
  // -------------------------------
  createFormLabels(forms, {onSelect} = {}) {
   console.log(onSelect)
    return forms.map(form => {
      const button = createUIComponent(
        {
          id: `form-${form.id}`,
          type: "button",
          label:form.label || `Form ${form.id}`,
          color: "#28a745",
          onClick: onSelect?() => onSelect(form):undefined
        },
        this.context
        
      );
      return button;
    });
  }

  createFormLabel(form, { onSelect }) {
    return createUIComponent(
      {
        id: `form-${form.id}`,
        type: 'button',
        label: form.label ?? `Form ${form.id}`,
        onClick: () => onSelect?.(form)
      },
      this.context
    );
  }

  createCommandButtons(children, commandMap) {
    return children.map(def => {
      const btn = createUIComponent(
        {
          id: `cmd-${def.id}`,
          type: "button",
          label: def.label
        },
        this.context
      );
  
      
        btn.onClick = () => commandMap.execute(def.command);
     
  
      return btn;
    });
  }

  // -------------------------------
  // Results table
  // -------------------------------
  createResultsTable(results) {
    const elements = [];

    if (!results.length) {
      elements.push(createUIComponent({
        id: "no-results",
        type: "text",
        label: "No results available."
      }, this.context, { place: false }));
      return elements;
    }

    elements.push(createUIComponent({
      id: "results-title",
      type: "text",
      label: "Form Results"
    }, this.context, { place: false }));

    results.forEach((result, index) => {
      const inputs = Object.entries(result.inputs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      elements.push(createUIComponent({
        id: `result-${index}`,
        type: "text",
        label: `Result ${index + 1}: ${inputs}`
      }, this.context, { place: false }));
    });

    return elements;
  }
}

export class ManifestUI extends UIElement{
    buildContainersFromManifest(manifest) {
        manifest.forEach(({ idSuffix, type, layout, assignTo }) => {
          const component = createUIComponent({
            id: `${this.id}-${idSuffix}`,
            type,
          }, this.context);
          component.layoutSpec = layout;
    
          this.addChild(component);
          if (assignTo) this[assignTo] = component;
        });
      }
      layout(x, y, width, height) {
        // Step 1: set own bounds
        this.bounds = { x, y, width, height };
    
        for (const child of this.children) {
          const spec = child.layoutSpec || {};
          const measured = child.measure({
            maxWidth: spec.width || width,
            maxHeight: spec.height || height
          });
      
          child.layout(
            spec.x ?? this.bounds.x,
            spec.y ?? this.bounds.y,
            spec.width ?? measured.width,
            spec.height ?? measured.height
          );
        }
      
      }
      measure(constraints = { maxWidth: Infinity, maxHeight: Infinity }) {
        let maxChildWidth = 0;
        let totalChildHeight = 0;
      
        for (const child of this.children) {
          const spec = child.layoutSpec || {};
          const childSize = child.measure({
            maxWidth: spec.width || constraints.maxWidth,
            maxHeight: spec.height || constraints.maxHeight
          });
          child._measured = childSize;
      
          maxChildWidth = Math.max(maxChildWidth, spec.width || childSize.width);
          totalChildHeight = Math.max(totalChildHeight, spec.height || childSize.height);
        }
      
        const width = Math.min(constraints.maxWidth, maxChildWidth);
        const height = Math.min(constraints.maxHeight, totalChildHeight);
      
        this._measured = { width, height };
        return this._measured;
      }
    
      buildChildrenFromManifest(manifest, targetContainer) {
        manifest.forEach(def => {
            const fullDef = {
                ...def,
                id: `${this.id}-${def.idSuffix || def.id || Math.random().toString(36).substr(2, 9)}`
            };
            
          const component = createUIComponent(fullDef, this.context);
          if(def.action){
            const screenRef = this.dashBoardScreen || this.createFormScreen;
            component.onClick = () => def.action(screenRef);
          }
          targetContainer.addChild(component);
        });
      }

      buildFormFromManifest(manifest, targetContainer, { onSubmit, onDelete } = {}) {
        const inputBoxes = new Map();
      
// Guard against invalid manifest
if (!manifest || !manifest.formStructure || !Array.isArray(manifest.formStructure.fields)) {
  console.warn("Invalid manifest passed to buildFormFromManifest:", manifest);
  return inputBoxes;
}

        manifest.formStructure.fields.forEach(field => {
          const component = createUIComponent(field, this.context, { place: false });
      
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

          // const deleteBtn = createUIComponent({
          //   id: `${this.id}-delete-btn-${field.id}`,
          //   type: 'button',
          //   label: 'Delete',
          //   color: '#dc3545',
          //   layout: { x: component.layout.width + 10, y: component.layout.y, width: 60, height: component.layout.height },
          //   onClick: () => {
          //     onDelete?.(field.id);
          //     targetContainer.removeChild(component);
          //     targetContainer.removeChild(deleteBtn);
          //   }
          // }, this.context);

          const fieldContainer = new UIFieldContainer({
            id: `${this.id}-field-container-${field.id}`,
            context: this.context,
            layoutManager: this.layoutManager,
            layoutRenderer: this.layoutRenderer,
            bgColor: 'rgba(0,0,0,0.2)' //transparent background
          });
          
          // fieldContainer.addChild(deleteBtn);
          targetContainer.addChild(fieldContainer);
          fieldContainer.addChild(component);
        });
      
        return inputBoxes;
      }
      displayAllForms(forms, targetContainer, { onSubmit }) {
        forms.forEach(form => {
          this.buildFormFromManifest(form, targetContainer, { onSubmit });
        });
      }
      displayFormsLabels(forms, targetContainer, { onSelect }) {
        targetContainer.clearChildren();
        forms.forEach(form => {
          const button = createUIComponent({
            id: `${this.id}-form-${form.id}`,
            type: 'button',
            label: form.label || `Form ${form.id}`,
            color: '#28a745',
            onClick: () => onSelect?.(form)
          }, this.context, { place: false });
          targetContainer.addChild(button);
        });
      }

      displayResultsTable(results, targetContainer) {
        targetContainer.clearChildren();
        if (results.length === 0) {
          const noResultsText = createUIComponent({
            id: `${this.id}-no-results`,
            type: 'text',
            label: 'No results available.'
          }, this.context, { place: false });
          targetContainer.addChild(noResultsText);
          return;
        }
      
        const title = createUIComponent({
          id: `${this.id}-results-title`,
          type: 'text',
          label: 'Form Results'
        }, this.context, { place: false });
        targetContainer.addChild(title);

        results.forEach((result, index) => {
          const inputs = Object.entries(result.inputs).map(([key, value]) => `${key}: ${value}`).join(', ');
          const resultText = createUIComponent({
            id: `${this.id}-result-${index}`,
            type: 'text',
            label: `Result ${index + 1}: ${inputs}`
          }, this.context, { place: false });
          targetContainer.addChild(resultText);
        });
      }
    
}