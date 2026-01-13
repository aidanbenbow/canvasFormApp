
import { ButtonNode } from "../nodes/buttonNode.js";
import { ContainerNode } from "../nodes/containerNode.js";
import { InputNode } from "../nodes/inputNode.js";
import { LabelNode } from "../nodes/labelNode.js";
import { ScrollNode } from "../nodes/scrollNode.js";
import { TextNode } from "../nodes/textNode.js";


export class BaseUIFactory {
    constructor(context) {
      this.context = context;
    }
  
    create(def, handlers = {}) {
      return this.createComponent(def, handlers);
    }
  
    createComponent(def, handlers={}) {
      return createUIComponent(def, this.context, handlers);
    }
  
  }

  export const componentRegistry = {
    button: (def) => new ButtonNode(def),
    label: (def) => new LabelNode(def),
    text: (def) => new TextNode(def),
    input: (def) => new InputNode(def),
    container: (def) => new ScrollNode(def),
    fieldContainer: (def) => new ContainerNode(def),
  };
  
  export function createUIComponent(def, context, handlers = {}) {
    const factory = componentRegistry[def.type];
    if (!factory) {
      throw new Error(`Unknown component type: ${def.type}`);
    }
  
    // Pass handlers into the node definition
    return factory({ ...def, handlers, context });
  }