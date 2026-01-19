// uiManifestCompiler.js

import { layoutRegistry } from '../registries/layoutRegistry.js';
import { containerRenderer } from '../renderers/containerRenderer.js';
import { ContainerNode } from './nodes/containerNode.js';
import { SceneNode } from './nodes/sceneNode.js';

export function compileUIManifest(manifest, factories, commandRegistry, handlers = {}) {
  const layoutFactory = layoutRegistry[manifest.layout];
console.log(manifest);
  // Create root
  const rootNode = new SceneNode({
    id: manifest.id || "root",
    layoutStrategy: layoutFactory(),
    renderStrategy: containerRenderer,
    children: []
  });

  const regions = {};

  // Build regions
  Object.entries(manifest.regions).forEach(([key, def]) => {
    const regionNode = new ContainerNode({
      id: key,
      style: def.style || {},
      children: []
    });

    // Add region to root
    regions[key] = regionNode;

    // Add children to region
    def.children.forEach((childDef) => {
      const factory = factories['basic']
      if (!factory) {
        throw new Error(`No factory found for type: ${childDef.type}`);
      }
      const childNode = factory.create(childDef, commandRegistry);
     
      regionNode.add(childNode);
    });
    rootNode.add(regionNode);
  
  });

console.log('Root Node:', rootNode);
  return { rootNode, regions };
}

