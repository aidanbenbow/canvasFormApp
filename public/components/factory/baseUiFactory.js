
import { ButtonNode } from "../nodes/buttonNode.js";
import { ContainerNode } from "../nodes/containerNode.js";
import { DropdownInputNode } from "../nodes/dropDownNode.js";
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
        const rootNode = pipeline.root;
        const shouldCollect = !def.skipCollect;
        const shouldClear = !def.skipClear;

        const fields = shouldCollect
          ? {
              ...collectInputValues(rootNode),
              messageYear: 26
            }
          : {};
        const finalPayload = {
          ...(def.payload || {}),
          ...(shouldCollect ? { fields } : {})
        };

        const actionName = def.action || def.command;
        if (!actionName) {
          console.warn(`Button ${def.id} has no action/command; click ignored.`);
          return;
        }

        commandRegistry.execute(actionName, finalPayload);
        if (shouldClear) {
          clearInputValues(rootNode);
        }
      }
  
      });
    }
    
    ,
    label: (def) => new LabelNode(def),
    text: (def) =>{ 
    const { context } = def;
      const node = new TextNode(def)
      context.fieldRegistry.set(def.id, node);
      return node;
    },
    input: (def) => {
      const { context } = def;
    const node =  new InputNode(def)
    context.fieldRegistry.set(def.id, node);
    return node;

    },
    container: (def) => new ScrollNode(def),
    fieldContainer: (def) => new ContainerNode(def),
    dropDown: (def) => {
    
      const registry = def.context.fieldRegistry;
      const node = new DropdownInputNode(def)
      if (def.onChangeFill) {
        node.on("select", ({ option }) => {
          if(!option.fills) return;
          Object.entries(option.fills).forEach(([id, value]) => {
            const target = registry.get(id);
          
            if (target) {
              target.value = value;
              target.invalidate();
            }
          });
        });
      }
 
    
    registry.set(def.id, node);
    return node; 
  },
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
      result[node.id] = typeof node.getValue === 'function' ? node.getValue() : node.value;
    }
  
    if (node.children) {
      for (const child of node.children) {
        collectInputValues(child, result);
      }
    }
  
    return result;
  }

  export function clearInputValues(node) {
    if (!node) return;
  
    if (node instanceof InputNode || node instanceof DropdownInputNode) {
      node.clear?.();
    }
  
    if (node.children) {
      for (const child of node.children) {
        clearInputValues(child);
      }
    }
  }