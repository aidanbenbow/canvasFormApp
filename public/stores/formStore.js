// public/stores/FormStore.js
export class FormStore {
  constructor(eventBus) {
    this.eventBus = eventBus;

    this.state = Object.freeze({
      forms: {},        // map by formId
      activeFormId: null,
      results: {}       // map: formId → array of results
    });

    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  subscribe(id, listener) {
    this.listeners.push({ id, listener });
    return () => {
      this.listeners = this.listeners.filter(l => l.id !== id);
    };
  }

  apply(nextState) {
    const prev = this.state;
    this.state = Object.freeze(nextState);

    const diff = this.computeDiff(prev, nextState);

    for (const { listener } of this.listeners) {
      listener({ state: this.state, diff });
    }

    this.eventBus.emit("formStore:changed", { state: this.state, diff });
  }

  computeDiff(prev, next) {
    const diff = {
      formsAdded: [],
      formsUpdated: [],
      formsRemoved: [],
      activeFormChanged: prev.activeFormId !== next.activeFormId,
      resultsChanged: []
    };

    const prevForms = prev.forms;
    const nextForms = next.forms;

    for (const id of Object.keys(nextForms)) {
      if (!prevForms[id]) diff.formsAdded.push(nextForms[id]);
      else if (prevForms[id].updatedAt !== nextForms[id].updatedAt)
        diff.formsUpdated.push(nextForms[id]);
    }

    for (const id of Object.keys(prevForms)) {
      if (!nextForms[id]) diff.formsRemoved.push(id);
    }

    for (const id of Object.keys(next.results)) {
      if (prev.results[id] !== next.results[id]) {
        diff.resultsChanged.push(id);
      }
    }

    return diff;
  }
}