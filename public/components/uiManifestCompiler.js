// uiManifestCompiler.js

import { layoutRegistry } from '../registries/layoutRegistry.js';
import { containerRenderer } from '../renderers/containerRenderer.js';
import { SceneNode } from './nodes/sceneNode.js';

export function compileUIManifest(manifest, factories) {
  const layoutFactory = layoutRegistry[manifest.layout];

  // Create root
  const rootNode = new SceneNode({
    id: manifest.id || 'root',
    layoutStrategy: layoutFactory(),
    renderStrategy: containerRenderer,
    children: []
  });

  const regions = {};

  // Build regions
  Object.entries(manifest.regions).forEach(([key, def]) => {
    const regionNode = new SceneNode({
      id: `${manifest.id || 'root'}-${key}`,
      layoutStrategy: layoutFactory(),
      renderStrategy: containerRenderer,
      children: []
    });

    rootNode.add(regionNode);
    regions[key] = regionNode;

    // Build children inside region
    if (def.children) {
      def.children.forEach(childDef => {
        const node = factories.commandUI.create({
          id: `cmd-${childDef.id}`,
          type: 'button',
          label: childDef.label,
          onClick: childDef.onClick
        });

        regionNode.add(node);
      });
    }
  });

  return { rootNode, regions };
}