import { FormModel } from '../../models/formModel.js';
import { compileUIManifest } from '../uiManifestCompiler.js';
import { registerCreateFormCommands } from './createFormCommands.js';

export function createFormModelAdapter(form) {
  const model = new FormModel(form);

  return {
    getForm: () => model.getForm(),
    getFields: () => model.getFields(),
    getResultsTable: () => model.getResultsTable(),
    setResultsTable: (resultsTable) => model.setResultsTable(resultsTable),
    setFields: (fields) => model.setFields(fields),
    addField: (field) => model.addField(field),
    deleteField: (fieldId) => model.deleteField(fieldId),
    reorderField: (sourceFieldId, targetFieldId) => model.reorderField(sourceFieldId, targetFieldId),
    normalize: () => model.normalize(),
    getFieldById: (fieldId) => model.getFieldById(fieldId)
  };
}

export function createCommandRegistryAdapter(commandRegistry) {
  return {
    getCommandRegistry: () => commandRegistry,
    registerCommands({ commands, handlers }) {
      registerCreateFormCommands({
        commandRegistry,
        commands,
        handlers
      });
    },
    unregisterCommands({ commands }) {
      if (!commandRegistry || !commands) return;
      const commandNames = Object.values(commands).filter((name) => typeof name === 'string');

      if (typeof commandRegistry.unregisterMany === 'function') {
        commandRegistry.unregisterMany(commandNames);
        return;
      }

      if (typeof commandRegistry.unregister === 'function') {
        for (const name of commandNames) {
          commandRegistry.unregister(name);
        }
      }
    }
  };
}

export function createCanvasUiRendererAdapter({ factories, commandRegistry, context } = {}) {
  let rootNode = null;
  let regions = null;

  return {
    renderManifest(manifest) {
      const rendered = compileUIManifest(manifest, factories, commandRegistry, context);
      rootNode = rendered?.rootNode ?? null;
      regions = rendered?.regions ?? null;
      return rendered;
    },

    updateRegion(regionId, children = []) {
      if (!regionId) return;
      const region = regions?.[regionId];
      if (!region) return;

      const nodes = (Array.isArray(children) ? children : [])
        .map((definition) => factories?.basic?.create(definition))
        .filter(Boolean);

      region.setChildren(nodes);
    },

    invalidate() {
      rootNode?.invalidate?.();
    },

    getRootNode() {
      return rootNode;
    },

    getRegions() {
      return regions;
    }
  };
}

export function createDomUiRendererAdapter({
  mount,
  renderNode,
  keyBy = (item, index) => item?.id || `item-${index}`
} = {}) {
  let rootNode = null;
  let regions = {};

  return {
    renderManifest(manifest) {
      rootNode = {
        id: manifest?.id || 'dom-root',
        manifest
      };

      regions = {};
      const entries = Object.entries(manifest?.regions || {});
      for (const [regionId, regionDef] of entries) {
        regions[regionId] = {
          id: regionId,
          children: Array.isArray(regionDef?.children) ? [...regionDef.children] : []
        };
      }

      if (typeof mount === 'function') {
        mount({ rootNode, regions, manifest });
      }

      return { rootNode, regions };
    },

    updateRegion(regionId, children = []) {
      if (!regionId) return;
      const region = regions?.[regionId];
      if (!region) return;

      const nextChildren = Array.isArray(children) ? [...children] : [];
      region.children = nextChildren;

      if (typeof renderNode === 'function') {
        renderNode({
          regionId,
          children: nextChildren.map((child, index) => ({
            key: keyBy(child, index),
            definition: child
          })),
          rootNode,
          regions
        });
      }
    },

    invalidate() {
      if (typeof renderNode === 'function') {
        for (const regionId of Object.keys(regions || {})) {
          const region = regions[regionId];
          renderNode({
            regionId,
            children: (region?.children || []).map((child, index) => ({
              key: keyBy(child, index),
              definition: child
            })),
            rootNode,
            regions
          });
        }
      }
    },

    getRootNode() {
      return rootNode;
    },

    getRegions() {
      return regions;
    }
  };
}

export function createPersistenceAdapter({
  onSave,
  onUpdate
} = {}) {
  return {
    onSave,
    onUpdate
  };
}
