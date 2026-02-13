import { ContainerNode } from "./containerNode.js";

export class KeyboardNode extends ContainerNode {
    constructor({ id = "keyboard",context, layout = "keyboard" }) {
      super({ id,context, layout, children: [] });

      this.isUppercase = false;
      this.mode = "alpha";
      this.hasClipboardBar = true;
      this.alphaLayout = [
        ['Paste'],
        ['1','2','3','4','5','6','7','8','9','0'],
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l','⇧'],
        ['SYM','z','x','c','v','b','n','m','←','↵','Space']
      ];
      this.punctLayout = [
        ['Paste'],
        ['1','2','3','4','5','6','7','8','9','0'],
        ['!','@','#','$','%','^','&','*','(',')'],
        ['-','_','/',';',':','"','\'','?','.',','],
        ['ABC','[',']','{','}','+','=','|','←','↵','Space']
      ];
      this.keyLayout = this.getDisplayLayout();
      this.hitTestable = false; // Keyboard itself doesn't receive events, but its children can
    }

    getDisplayLayout() {
      const layout = this.mode === "punct" ? this.punctLayout : this.alphaLayout;
      return layout.map((row) =>
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

    toggleMode() {
      this.mode = this.mode === "punct" ? "alpha" : "punct";
      this.keyLayout = this.getDisplayLayout();
    }

    getFlatLayout() {
      return this.keyLayout.flat();
    }

    getKeyWeight(key) {
      if (key === "Paste") return 6;
      if (key === "Space") return 2.5;
      if (key === "↵") return 1.8;
      if (key === "SYM" || key === "ABC") return 1.4;
      return 1;
    }
  }