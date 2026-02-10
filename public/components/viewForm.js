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
      style: {
        background: "#f9f9f9",
      },
      children: []
    }
  }
};


export class FormViewScreen extends BaseScreen {
  constructor({ context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, results }) {
    super({ id: "form-view", context, dispatcher, eventBusManager });
this.context = context;
    this.store = store;
    this.children = this.store.getActiveForm()?.formStructure || {};
    console.log(this.store.getActiveForm())
    this.childArray = Object.values(this.children);
 
    this.manifest = formViewUIManifest;
    this.createManfest();
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.onSubmit = onSubmit;
    this.results = results;
    
  }
  createManfest() {
        for(let child of this.childArray){
            this.manifest.regions.formContainer.children.push(...child);
        }
       
  }
  createRoot() {
    const { rootNode, regions } = compileUIManifest(
      this.manifest,
      this.factories,
      this.commandRegistry,
      this.context,
      this.results
    );

    this.rootNode = rootNode;
    this.regions = regions;

    this.updateDeFacut()

    return rootNode;
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
