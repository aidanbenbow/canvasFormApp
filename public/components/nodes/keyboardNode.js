import { ContainerNode } from "./containerNode.js";

export class KeyboardNode extends ContainerNode {
    constructor({ id = "keyboard",context, layout = "keyboard" }) {
      super({ id,context, layout, children: [] });

      this.isUppercase = false;
      this.mode = "alpha";
      this.hasClipboardBar = true;
      this.shiftOnce = false;
      this.suggestions = ["the", "and", "to"];
      this.alphaLayout = [
        ['Paste', '__SUGG_1__', '__SUGG_2__', '__SUGG_3__'],
        ['1','2','3','4','5','6','7','8','9','0'],
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l','⇧'],
        ['SYM','z','x','c','v','b','n','m','←','↵','Space']
      ];
      this.punctLayout = [
        ['Paste', '__SUGG_1__', '__SUGG_2__', '__SUGG_3__'],
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
      if (this.isSuggestionToken(key)) {
        const index = this.getSuggestionIndex(key);
        return this.suggestions[index] || "...";
      }
      if (!this.isLetter(key)) return key;
      return this.isUppercase ? key.toUpperCase() : key.toLowerCase();
    }

    isSuggestionToken(key) {
      return /^__SUGG_[1-3]__$/.test(key);
    }

    getSuggestionIndex(key) {
      if (!this.isSuggestionToken(key)) return -1;
      const match = key.match(/^__SUGG_([1-3])__$/);
      return match ? Number(match[1]) - 1 : -1;
    }

    setSuggestions(nextSuggestions = []) {
      const sanitized = (nextSuggestions || []).map((item) => String(item || '').trim()).filter(Boolean);
      while (sanitized.length < 3) {
        sanitized.push('...');
      }
      this.suggestions = sanitized.slice(0, 3);
      this.keyLayout = this.getDisplayLayout();
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
      if (this.isSuggestionToken(key)) return 5;
      if (key === "Space") return 2.5;
      if (key === "↵") return 1.8;
      if (key === "SYM" || key === "ABC") return 1.4;
      return 1;
    }
  }