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
  beneficiaries.sort((a, b) => {
    const nameA = (a?.name ?? "").toString();
    const nameB = (b?.name ?? "").toString();
    return nameA.localeCompare(nameB);
  });
  walkDefs(clone, (def) => {
    if (def.type === "dropDown" && def.dataSource === "beneficiaries") {
      def.options = beneficiaries.map((b, index) => {
        const label = firstNonEmpty(
          pickField(b, [
            "name",
            "nameInput",
            "input-name",
            "input-nameInput",
            "beneficiary",
            "beneficiaryName",
            "fullName",
            "title"
          ]),
          b?.name,
          b?.label,
          b?.fullName,
          b?.title,
          b?.id,
          b?.value
        ) ?? `Option ${index + 1}`;
        const value = firstNonEmpty(
          pickField(b, ["name", "nameInput", "input-name", "input-nameInput"]),
          b?.name,
          b?.value,
          b?.id,
          label
        );

        return {
          label,
          value,
          fills: {
            messageInput: firstNonEmpty(
              pickField(b, ["messageInput", "message", "messageText"]),
              b?.message,
              b?.messageInput,
              b?.messageText
            ),
            reportInput: firstNonEmpty(
              pickField(b, ["reportInput", "report", "reportText"]),
              b?.report,
              b?.reportInput,
              b?.reportText
            )
          }
        };
      });
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

    if (def.command && !def.action) {
      def.action = def.command;
    }

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

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const str = String(value).trim();
    if (str) return str;
  }
  return null;
}

function pickField(entry, keys) {
  if (!entry) return null;

  const sources = [
    entry,
    entry.fields,
    entry.responses,
    entry.responseData?.responses,
    entry.data,
    entry.payload
  ].filter(Boolean);

  for (const key of keys) {
    for (const source of sources) {
      if (source && source[key] !== undefined && source[key] !== null) {
        return source[key];
      }
    }
  }

  return null;
}
