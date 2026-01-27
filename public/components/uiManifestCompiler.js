// uiManifestCompiler.js

import { layoutRegistry } from '../registries/layoutRegistry.js';
import { containerRenderer } from '../renderers/containerRenderer.js';
import { ButtonNode } from './nodes/buttonNode.js';
import { ContainerNode } from './nodes/containerNode.js';
import { KeyboardNode } from './nodes/keyboardNode.js';
import { PopUpNode } from './nodes/popUpNode.js';
import { SceneNode } from './nodes/sceneNode.js';
import { TextNode } from './nodes/textNode.js';

export function compileUIManifest(manifest, factories, commandRegistry, handlers = {}) {
  const layoutFactory = layoutRegistry[manifest.layout];

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
      const childNode = factory.create(childDef);
     
      regionNode.add(childNode);
    });
    rootNode.add(regionNode);
  
  });

console.log('Root Node:', rootNode);
  return { rootNode, regions };
}

