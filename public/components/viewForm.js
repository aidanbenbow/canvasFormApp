import { BaseScreen } from "./baseScreen.js";
import { compileUIManifest } from "./uiManifestCompiler.js";

const formViewUIManifest = {
  layout: "vertical",
id: "form-view-root",
  regions: {
    formContainer: {
      type: "container",
      layout: "vertical"
    }
  }
};

export class FormViewScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit }) {
    super({ id: "form-view", context, dispatcher, eventBusManager });

    this.store = store;
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.onSubmit = onSubmit;
  }

  createRoot() {
    const { rootNode, regions } = compileUIManifest(
      formViewUIManifest,
      this.factories,
      this.commandRegistry
    );

    this.rootNode = rootNode;
    this.regions = regions;

    return rootNode;
  }
  onEnter() {
    const activeForm = this.store.getActiveForm();
    if (!activeForm) return;
  
    const manifest = {
      id: "form-view-root",
      layout: "vertical",
      regions: {
        fields: {
          children: [
            { type: "input", id: "name", label: "Dorcas" },
            { type: "input", id: "report", label: "Report", placeholder: "Enter text..." },
            { type: "formButton", id: "submit", label: "Submit", command: "submitForm" }
          ]
        }
      }
    };
  
    const { regions } = compileUIManifest(
      manifest,
      this.factories,
      this.commandRegistry,
      {onChange: (fieldId, value) => {
        console.log(`Field ${fieldId} changed to:`, value);
      },
      onSubmit: () => {
        const responseData = {
          name: regions.fields.children.find(c => c.id === 'name')?.state.value,
          report: regions.fields.children.find(c => c.id === 'report')?.state.value
        };
        this.onSubmit?.(responseData);

      }
    }
    );
  
    this.regions.formContainer.setChildren(regions.fields.children);
    this.rootNode.invalidate?.();
  }

  onExit() {
    // If you later bind store subscriptions here, clean them up.
  }
}