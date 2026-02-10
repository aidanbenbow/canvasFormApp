// uiManifestCompiler.js

import { layoutRegistry } from '../registries/layoutRegistry.js';
import { containerRenderer } from '../renderers/containerRenderer.js';
import { ContainerNode } from './nodes/containerNode.js';
import { SceneNode } from './nodes/sceneNode.js';

export function compileUIManifest(manifest, factories, commandRegistry,context,results, handlers = {}) {
const preprocessedManifest = preprocessManifest(manifest, results);
console.log('Preprocessed Manifest:', preprocessedManifest);
  const layoutFactory = layoutRegistry[preprocessedManifest.layout];

  // Create root
  const rootNode = new SceneNode({
    id: preprocessedManifest.id || "root",
    layoutStrategy: layoutFactory(),
    renderStrategy: containerRenderer,
    children: []
  });

  const regions = {};

  // Build regions
  Object.entries(preprocessedManifest.regions).forEach(([key, def]) => {
    const regionNode = new ContainerNode({
      id: key,
      context,
      style: def.style || {},
      children: [],
      scrollable: def.scrollable || false,
      viewport: def.viewport || 400
    });

    // Add region to root
    regions[key] = regionNode;

    // Add children to region
    def.children.forEach((childDef) => {
      const factory = factories['basic']
      if (!factory) {
        throw new Error(`No factory found for type: ${childDef.type}`);
      }
      const childNode = factory.create(childDef);
     
      regionNode.add(childNode);
    });
    rootNode.add(regionNode);
  
  });

console.log('Root Node:', rootNode);
  return { rootNode, regions };
}

function preprocessManifest(manifest, results) {
  const clone = structuredClone(manifest);
  const beneficiaries = Array.isArray(results) ? results : [];
  beneficiaries.sort((a, b) => a.name.localeCompare(b.name));
  walkDefs(clone, (def) => {
    if (def.type === "dropDown" && def.dataSource === "beneficiaries") {
      def.options = beneficiaries.map(b => ({
        label: b.name,
        value: b.name,
        fills: {
          messageInput: b.message,
          reportInput: b.report
        }
      }));
    }
  });

  return clone;
}
export function walkDefs(manifest, visitor) {
  if (!manifest?.regions) return;

  for (const region of Object.values(manifest.regions)) {
    walkDefArray(region.children, visitor);
  }
}

function walkDefArray(children, visitor) {
  if (!Array.isArray(children)) return;

  for (const def of children) {
    if (!def) continue;

    // Run your callback on this node
    visitor(def);

    // Recurse into nested children
    if (Array.isArray(def.children)) {
      walkDefArray(def.children, visitor);
    }

    // Optional: if you later support other nested fields
    // e.g. def.content, def.items, def.fields, etc
  }
}
