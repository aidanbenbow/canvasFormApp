// uiManifestCompiler.js

import { layoutRegistry } from '../registries/layoutRegistry.js';
import { containerRenderer } from '../renderers/containerRenderer.js';
import { SceneNode } from './nodes/sceneNode.js';

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
    const regionNode = new SceneNode({
      id: `${manifest.id || "root"}-${key}`,
      layoutStrategy: layoutFactory(),
      renderStrategy: containerRenderer,
      children: []
    });

    rootNode.add(regionNode);
    regions[key] = regionNode;

    // If region has children, compile them
    if (def.children) {
      def.children.forEach(childDef => {
        let node;

        // If this is a form field, use FormsUIFactory
        if (childDef.type in factories.formsUI.fieldRegistry) {
          node = factories.formsUI.createField(childDef, handlers);
        } else {
          // Otherwise use CommandUIFactory
          node = factories.commandUI.create(childDef);
        }

        regionNode.add(node);
      });
    }
  });

  return { rootNode, regions };
}

// export function compileUIManifest(manifest, factories, commandRegistry) {
//   const layoutFactory = layoutRegistry[manifest.layout];

//   // Create root
//   const rootNode = new SceneNode({
//     id: manifest.id || 'root',
//     layoutStrategy: layoutFactory(),
//     renderStrategy: containerRenderer,
//     children: []
//   });

//   const regions = {};

//   // Build regions
//   Object.entries(manifest.regions).forEach(([key, def]) => {
//     const regionNode = new SceneNode({
//       id: `${manifest.id || 'root'}-${key}`,
//       layoutStrategy: layoutFactory(),
//       renderStrategy: containerRenderer,
//       children: []
//     });

//     rootNode.add(regionNode);
//     regions[key] = regionNode;

//     // Build children inside region
//     if (def.children) {
//       def.children.forEach(childDef => {
//         const node = factories.commandUI.create({
//           id: `cmd-${childDef.id}`,
//           type: 'button',
//           label: childDef.label,
//           onClick: () => {
//             console.log("Button clicked:", childDef.command);
//             commandRegistry.execute(childDef.command);
//           }
//         });

//         regionNode.add(node);
//       });
//     }
//   });

//   return { rootNode, regions };
// }