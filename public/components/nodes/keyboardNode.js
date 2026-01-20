import { ContainerNode } from "./containerNode.js";

export class KeyboardNode extends ContainerNode {
    constructor({ id = "keyboard", layout = "keyboard" }) {
      super({ id, layout, children: [] });
  
      this.keyLayout = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M'],
        ['←','Space','↵']
      ];
    }
  }