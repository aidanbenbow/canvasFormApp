import { ACTIONS } from "../events/actions.js";
import { BaseScreen } from "./baseScreen.js";
import { InputNode } from "./nodes/inputNode.js";
import { compileUIManifest } from "./uiManifestCompiler.js";

const formViewUIManifest = {
  layout: "centre",
id: "form-view-root",
style: {
  background: "#ffffff",
},
  regions: {
    formContainer: {
      type: "container",
      scrollable: true,
      viewport: 600,
      style: {
        background: "#f9f9f9",
      },
      children: []
    }
  }
};


export class FormViewScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, results, formId }) {
    super({ id: "form-view", context, dispatcher, eventBusManager });
    this.context = context;
    this.store = store;
    this.formId = formId ?? this.store.getActiveForm()?.id ?? null;
    this.children = this.store.getActiveForm()?.formStructure || {};
    this.childArray = Object.values(this.children);

    this.manifest = structuredClone(formViewUIManifest);
    this.manifest.regions.formContainer.viewport = this.getResponsiveViewport();
    this.createManfest();
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.onSubmit = onSubmit;
    this.results = results ?? (this.formId ? this.store.getFormResults(this.formId) : []);
  }
  createManfest() {
        const normalizedChildren = [];
        for (const child of this.childArray) {
          for (const field of child) {
            if (field?.type === 'button' && !field.action && !field.command) {
              normalizedChildren.push({
                ...field,
                action: 'form.submit'
              });
            } else {
              normalizedChildren.push(field);
            }
          }
        }

        this.manifest.regions.formContainer.children = normalizedChildren;
       
  }
  createRoot() {
    this.manifest.regions.formContainer.viewport = this.getResponsiveViewport();
    const effectiveResults = this.results ?? (this.formId ? this.store.getFormResults(this.formId) : []);
    const { rootNode, regions } = compileUIManifest(
      this.manifest,
      this.factories,
      this.commandRegistry,
      this.context,
      effectiveResults
    );

    this.rootNode = rootNode;
    this.regions = regions;

    this.results = effectiveResults;

    this.updateDeFacut()

    return rootNode;
  }

  getResponsiveViewport() {
    if (typeof window === 'undefined') return 600;

    const screenHeight = window.innerHeight || 800;
    if (screenHeight < 700) {
      return Math.max(360, Math.floor(screenHeight * 0.62));
    }

    if (screenHeight < 1000) {
      return Math.max(460, Math.floor(screenHeight * 0.7));
    }

    return Math.max(560, Math.floor(screenHeight * 0.76));
  }
  updateDeFacut() {
    const remaining = (this.results || []).filter(r => r.done !== true).length;
  
    const node = this.context.fieldRegistry.get("defacut-text");
    if (!node) return;
  
    node.text = String(remaining);
    node.invalidate();
  }
  
  onEnter() {
   
  }

  onExit() {
    // If you later bind store subscriptions here, clean them up.
  }
}

const manifest = {
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
