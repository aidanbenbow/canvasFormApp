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
    this.commandRegistry = commandRegistry;
    this.copyFieldCommands = new Set();

    this.manifest = structuredClone(formViewUIManifest);
    this.manifest.regions.formContainer.viewport = this.getResponsiveViewport();
    this.createManfest();
    this.factories = factories;
    this.onSubmit = onSubmit;
    this.results = results ?? (this.formId ? this.store.getFormResults(this.formId) : []);
  }
  createManfest() {
        const compactSubmitStyle = isSmallScreen()
          ? {
              fillWidth: false,
              font: '28px sans-serif',
              paddingX: 26,
              paddingY: 14,
              minHeight: 64,
              radius: 8
            }
          : {
              fillWidth: false,
              font: '18px sans-serif',
              paddingX: 16,
              paddingY: 8,
              minHeight: 38,
              radius: 6
            };

        const copyButtonStyle = isSmallScreen()
          ? {
              fillWidth: false,
              font: '24px sans-serif',
              paddingX: 18,
              paddingY: 10,
              minHeight: 54,
              radius: 8
            }
          : {
              fillWidth: false,
              font: '16px sans-serif',
              paddingX: 12,
              paddingY: 6,
              minHeight: 34,
              radius: 6
            };

        const normalizedChildren = [];
        for (const child of this.childArray) {
          for (const field of child) {
            if (this.isPhotoLikeField(field)) {
              const source = this.getPhotoSource(field);
              const previewId = `photo-preview-${field.id}`;

              normalizedChildren.push({
                ...field,
                type: 'input',
                value: source,
                placeholder: field.placeholder || 'Enter photo URL...'
              });

              normalizedChildren.push({
                type: 'photo',
                id: previewId,
                src: source,
                style: {
                  fillWidth: true,
                  borderColor: '#93c5fd',
                  backgroundColor: '#eff6ff'
                }
              });
              continue;
            }

            if (this.shouldAddCopyButton(field)) {
              const copyCommand = this.ensureCopyCommand(field.id);
              normalizedChildren.push(field);
              normalizedChildren.push({
                type: 'button',
                id: `copy-${field.id}`,
                label: 'Copy',
                action: copyCommand,
                skipCollect: true,
                skipClear: true,
                style: copyButtonStyle
              });
              continue;
            }

            if (field?.type === 'button' && !field.action && !field.command) {
              normalizedChildren.push({
                ...field,
                action: 'form.submit',
                style: {
                  ...(field.style || {}),
                  ...compactSubmitStyle
                }
              });
            } else if (field?.type === 'button') {
              normalizedChildren.push({
                ...field,
                style: {
                  ...(field.style || {}),
                  ...compactSubmitStyle
                }
              });
            } else {
              normalizedChildren.push(field);
            }
          }
        }

        this.manifest.regions.formContainer.children = normalizedChildren;
       
  }

  getPhotoSource(field) {
    return String(field?.src || field?.text || field?.value || '').trim();
  }

  isPhotoLikeField(field) {
    if (!field) return false;
    if (field.type === 'photo') return true;

    const probe = `${field.id || ''} ${field.label || ''} ${field.placeholder || ''}`.toLowerCase();
    const hasPhotoKeyword = /photo|image|picture|thumbnail/.test(probe);
    const hasUrlKeyword = /url|link/.test(probe);
    return field.type === 'input' && (hasPhotoKeyword || hasUrlKeyword);
  }

  shouldAddCopyButton(field) {
    if (!field || field.type !== 'input') return false;
    const idText = String(field.id || '').toLowerCase();
    const labelText = String(field.label || field.text || '').toLowerCase();
    return /message/.test(idText) || /message/.test(labelText);
  }

  ensureCopyCommand(fieldId) {
    const commandName = `${this.id}.copy.${fieldId}`;
    if (this.copyFieldCommands.has(commandName)) {
      return commandName;
    }

    this.commandRegistry.register(commandName, async () => {
      const node = this.context?.fieldRegistry?.get(fieldId);
      const value = node?.getValue?.() ?? node?.value ?? '';
      const text = String(value || '');
      if (!text) return;

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return;
        } catch (_) {
        }
      }

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });

    this.copyFieldCommands.add(commandName);
    return commandName;
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

    this.bindPhotoPreviewHandlers();

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

  bindPhotoPreviewHandlers() {
    const entries = [];
    for (const child of this.childArray) {
      for (const field of child) {
        if (!this.isPhotoLikeField(field)) continue;
        entries.push(field);
      }
    }

    for (const field of entries) {
      const inputNode = this.context?.fieldRegistry?.get(field.id);
      const previewNode = this.context?.fieldRegistry?.get(`photo-preview-${field.id}`);
      if (!inputNode || !previewNode) continue;

      inputNode.onChange = (value) => {
        if (typeof previewNode.setSource === 'function') {
          previewNode.setSource(value);
        } else {
          previewNode.src = String(value || '').trim();
          previewNode.loadImage?.();
          previewNode.invalidate?.();
        }
      };

      const initialValue = inputNode.getValue?.() ?? inputNode.value ?? this.getPhotoSource(field);
      if (typeof previewNode.setSource === 'function') {
        previewNode.setSource(initialValue);
      }
    }
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

function isSmallScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}
