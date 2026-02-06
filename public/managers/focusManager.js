import { ACTIONS } from "../events/actions.js";

export class FocusManager {
    constructor(uiState, dispatcher) {
      this.uiState = uiState;
      this.dispatcher = dispatcher;
      this.focusedNode = null;
    }
  
    focus(Node) {
      console.log("Focusing Node:", Node);
      if (this.focusedNode===Node) {
       return; // Node is already focused, do nothing
      }
  
      if (this.focusedNode) {
        console.log("Node is already focused:", Node);
        this.uiState.update(this.focusedNode, { focused: false });
        this.focusedNode.setUIState?.({ focused: false }); // if Node has setUIState method, call it
        this.dispatcher.dispatch(ACTIONS.UI.BLUR, { Node: this.focusedNode });
        this.focusedNode.context.pipeline.invalidate();
      }
  
      this.focusedNode = Node;
      this.uiState.update(Node, { focused: true });
      Node.setUIState?.({ focused: true }); // if Node has setUIState method, call it
      this.dispatcher.dispatch(ACTIONS.UI.FOCUS, { Node });
      Node.context.pipeline.invalidate();
    }
  
    blur(Node) {
      if (this.focusedNode === Node) {
        this.uiState.update(Node, { focused: false });
        Node.setUIState?.({ focused: false }); // if Node has setUIState method, call it
         Node.context.pipeline.invalidate();
        this.focusedNode = null;
      }
      this.dispatcher.dispatch(ACTIONS.UI.BLUR, { Node } );
    }
  }