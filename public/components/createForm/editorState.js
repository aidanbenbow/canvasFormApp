export class EditorState {
  constructor({
    mode = 'create',
    selectedFieldId = null,
    draggingFieldId = null,
    previewInsertionBeforeFieldId = null
  } = {}) {
    this.state = {
      mode,
      selectedFieldId,
      draggingFieldId,
      previewInsertionBeforeFieldId
    };
    this.listeners = new Set();
  }

  getSnapshot() {
    return { ...this.state };
  }

  getMode() {
    return this.state.mode;
  }

  getSelectedFieldId() {
    return this.state.selectedFieldId;
  }

  getDraggingFieldId() {
    return this.state.draggingFieldId;
  }

  getPreviewInsertionBeforeFieldId() {
    return this.state.previewInsertionBeforeFieldId;
  }

  set(partialState = {}) {
    if (!partialState || typeof partialState !== 'object') return;

    const nextState = {
      ...this.state,
      ...partialState
    };

    const changedKeys = Object.keys(nextState).filter((key) => nextState[key] !== this.state[key]);
    if (!changedKeys.length) return;

    const previousState = this.getSnapshot();
    this.state = nextState;
    const currentState = this.getSnapshot();

    for (const listener of this.listeners) {
      listener(currentState, previousState, changedKeys);
    }
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
