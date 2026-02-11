import { ContainerNode } from "./containerNode.js";

export class KeyboardNode extends ContainerNode {
    constructor({ id = "keyboard",context, layout = "keyboard" }) {
      super({ id,context, layout, children: [] });

      this.isUppercase = false;
      this.baseLayout = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['⇧','z','x','c','v','b','n','m','←'],
        ['Space','↵']
      ];
      this.keyLayout = this.getDisplayLayout();
      this.hitTestable = false; // Keyboard itself doesn't receive events, but its children can
    }

    getDisplayLayout() {
      return this.baseLayout.map((row) =>
        row.map((key) => this.isLetter(key)
          ? (this.isUppercase ? key.toUpperCase() : key)
          : key
        )
      );
    }

    isLetter(key) {
      return /^[a-z]$/i.test(key);
    }

    getKeyLabel(key) {
      if (!this.isLetter(key)) return key;
      return this.isUppercase ? key.toUpperCase() : key.toLowerCase();
    }

    toggleCase() {
      this.isUppercase = !this.isUppercase;
      this.keyLayout = this.getDisplayLayout();
    }
  }