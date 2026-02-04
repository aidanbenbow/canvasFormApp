import { ACTIONS } from "../events/actions.js";

export class FocusManager {
    constructor(uiState, dispatcher) {
      this.uiState = uiState;
      this.dispatcher = dispatcher;
      this.focusedNode = null;
    }
  
    focus(Node) {
      console.log("Focusing Node:", Node);
      if (this.focusedNode === Node) return;
  
      if (this.focusedNode) {
        this.uiState.update(this.focusedNode, { focused: false });
        this.dispatcher.dispatch(ACTIONS.UI.BLUR, { Node: this.focusedNode });
      }
  
      this.focusedNode = Node;
      this.uiState.update(Node, { focused: true });
      this.dispatcher.dispatch(ACTIONS.UI.FOCUS, { Node });
    }
  
    blur(Node) {
      if (this.focusedNode === Node) {
        this.uiState.update(Node, { focused: false });
        this.focusedNode = null;
      }
      this.dispatcher.dispatch(ACTIONS.UI.BLUR, { Node } );
    }
  }