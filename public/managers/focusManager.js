export class FocusManager {
    constructor(uiState) {
      this.uiState = uiState;
      this.focusedId = null;
    }
  
    focus(id) {
      console.log("Focusing ID:", id);
      if (this.focusedId === id) return;
  
      if (this.focusedId) {
        this.uiState.update(this.focusedId, { focused: false });
      }
  
      this.focusedId = id;
      this.uiState.update(id, { focused: true });
    }
  
    blur(id) {
      if (this.focusedId === id) {
        this.uiState.update(id, { focused: false });
        this.focusedId = null;
      }
    }
  }