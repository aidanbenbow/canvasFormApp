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

  //add popupnodes if any
  const popupnode = new PopUpNode({
    id: 'popup-region',
    layout: 'popup',
    backgroundColor: 'rgba(0,0,0,0.5)',
    spacing: 10
  });

  const hello = new TextNode({
    id: 'popup-text',
    text: 'Hello, this is a popup!',
    style: {
      font: '24px Arial',
      color: '#fff',
      padding: '20px',
      backgroundColor: '#333',
      borderRadius: '8px'
    }
  });

  const keyboard = new KeyboardNode({
    id: 'on-screen-keyboard',
    layout: 'keyboard',
    style: {
      position: 'absolute',
      bottom: '0',
      width: '100%',
      backgroundColor: '#ccc'
    }
  });

  keyboard.keyLayout.forEach((row,rowIndex) => {
     row.forEach((key,keyIndex) => {
       const keyNode = new ButtonNode({
          id: `key-${rowIndex}-${keyIndex}`,
          label: key,
          style: {
            font: '18px Arial',
            color: '#000',
            backgroundColor: '#eee',
            borderRadius: '4px',
            margin: '2px'
          },
          onClick: () => {
            console.log(`Key pressed: ${key}`);
            if(handlers.onKeyPress){
              handlers.onKeyPress(key);
            }
          }
        });
       keyboard.add(keyNode);
     });
  } );

  popupnode.add(hello)
  popupnode.add(keyboard)
  popupnode.show();

  rootNode.add(popupnode);

console.log('Root Node:', rootNode);
  return { rootNode, regions };
}

