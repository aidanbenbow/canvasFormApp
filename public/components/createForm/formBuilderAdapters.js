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

      const definitions = Array.isArray(children) ? children : [];
      const oldChildren = Array.isArray(region.children) ? region.children : [];
      const oldMap = new Map();

      for (const child of oldChildren) {
        const childKey = getNodeKey(child);
        if (!childKey) continue;
        oldMap.set(childKey, child);
      }

      const nextChildren = [];
      definitions.forEach((definition, index) => {
        const key = getDefinitionKey(definition, index);
        const existing = oldMap.get(key);

        if (isCompatibleNode(existing, definition)) {
          existing.key = key;
          updateNodeShallow(existing, definition);
          nextChildren.push(existing);
          return;
        }

        const created = createNodeFromDefinition(factories, definition, key);
        if (created) {
          nextChildren.push(created);
        }
      });

      region.setChildren(nextChildren);
      region.invalidate?.();
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

function getDefinitionKey(definition, index) {
  const preferredKey = definition?.key ?? definition?.id;
  if (preferredKey !== undefined && preferredKey !== null && String(preferredKey).trim() !== '') {
    return String(preferredKey);
  }
  return `idx-${index}`;
}

function getNodeKey(node) {
  const preferredKey = node?.key ?? node?.id;
  if (preferredKey === undefined || preferredKey === null) return null;
  const normalized = String(preferredKey).trim();
  return normalized || null;
}

function isCompatibleNode(node, definition) {
  if (!node || !definition) return false;

  const definitionType = String(definition.type || '').trim();
  const nodeType = String(node.__definitionType || '').trim();

  if (!definitionType) return true;
  if (!nodeType) return true;
  return nodeType === definitionType;
}

function createNodeFromDefinition(factories, definition, key) {
  const node = factories?.basic?.create(definition);
  if (!node) return null;

  node.key = key;
  node.__definitionType = definition?.type;
  return node;
}

function updateNodeShallow(node, definition) {
  if (!node || !definition) return;

  const transientState = snapshotTransientState(node);
  const isFocused = Boolean(transientState.uiState?.focused);

  if (definition.text !== undefined && !isFocused) node.text = definition.text;
  if (definition.value !== undefined && !isFocused) node.value = definition.value;
  if (definition.label !== undefined) node.label = definition.label;
  if (definition.placeholder !== undefined) node.placeholder = definition.placeholder;
  if (definition.editable !== undefined) node.editable = definition.editable;
  if (definition.options !== undefined) node.options = Array.isArray(definition.options)
    ? [...definition.options]
    : definition.options;
  if (definition.style) node.style = { ...(node.style || {}), ...definition.style };

  node.__definitionType = definition?.type;
  restoreTransientState(node, transientState);
  node.invalidate?.();
}

function snapshotTransientState(node) {
  const uiState = node?.uiState && typeof node.uiState === 'object'
    ? {
        focused: node.uiState.focused,
        hovered: node.uiState.hovered,
        pressed: node.uiState.pressed,
        selected: node.uiState.selected
      }
    : {};

  const state = node?.state && typeof node.state === 'object'
    ? { ...node.state }
    : null;

  return { uiState, state };
}

function restoreTransientState(node, transientState) {
  if (!node || !transientState) return;

  if (transientState.state && typeof node.state === 'object') {
    node.state = { ...node.state, ...transientState.state };
  }

  const uiStatePatch = Object.fromEntries(
    Object.entries(transientState.uiState || {}).filter(([, value]) => value !== undefined)
  );

  if (!Object.keys(uiStatePatch).length) return;

  const uiStateStore = node.context?.uiState;
  if (uiStateStore?.update && node.id) {
    uiStateStore.update(node.id, uiStatePatch);
  }
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
