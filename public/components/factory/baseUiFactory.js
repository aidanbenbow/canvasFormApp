
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
    input: (def) => {
      const { context } = def;
    const node =  new InputNode(def)
    context.fieldRegistry.set(def.id, node);
    return node;

    },
    container: (def) => new ScrollNode(def),
    fieldContainer: (def) => new ContainerNode(def),
    dropDown: (def) => {
      def.options = [
        {
          label: "Option 1",
          value: "opt1",
          fills: {
            messageInput: "Hello from option 1",
            reportInput: "Report for option 1"
          }
        },
        {
          label: "Option 2",
          value: "opt2",
          fills: {
            messageInput: "Hello from option 2",
            reportInput: "Report for option 2"
          }
        },
        {
          label: "Option 3",
          value: "opt3",
          fills: {
            messageInput: "Hello from option 3",
            reportInput: "Report for option 3"
          }
        }
      ];
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
      result[node.id] = node.value;
    }
  
    if (node.children) {
      for (const child of node.children) {
        collectInputValues(child, result);
      }
    }
  
    return result;
  }
