
import { ButtonNode } from "../nodes/buttonNode.js";
import { ContainerNode } from "../nodes/containerNode.js";
import { InputNode } from "../nodes/inputNode.js";
import { LabelNode } from "../nodes/labelNode.js";
import { ScrollNode } from "../nodes/scrollNode.js";
import { TextNode } from "../nodes/textNode.js";


export class BaseUIFactory {
    constructor(context, commandRegistry) {
      this.context = context;
      this.commandRegistry = commandRegistry;

    }
  
    create(def) {
      return this.createComponent(def);
    }
  
    createComponent(def) {
      return createUIComponent(def, {
        ...this.context,
        commandRegistry: this.commandRegistry
      });
    }
  
  }

  export const componentRegistry = {
    button: (def) => {
      const { context } = def;
      const { commandRegistry, pipeline } = context;
    
    return new ButtonNode({
      ...def,
      onClick: () => {
        const rootNode = pipeline.root
        const fields = collectInputValues(rootNode);
  
        const finalPayload = {
          ...(def.payload || {}),
          fields
        };
  
        commandRegistry.execute(def.action, finalPayload);
      }
  
      });
    }
    
    ,
    label: (def) => new LabelNode(def),
    text: (def) => new TextNode(def),
    input: (def) => new InputNode(def),
    container: (def) => new ScrollNode(def),
    fieldContainer: (def) => new ContainerNode(def),
  };
  
  export function createUIComponent(def, context) {
    const factory = componentRegistry[def.type];
    if (!factory) {
      throw new Error(`Unknown component type: ${def.type}`);
    }
 
    return factory({ ...def, context });
  }

  function collectInputValues(node, result = {}) {
    if (node instanceof InputNode) {
      result[node.id] = node.value;
    }
  
    if (node.children) {
      for (const child of node.children) {
        collectInputValues(child, result);
      }
    }
  
    return result;
  }