export class ResultsStore {
  constructor() {
    this.eventBus = null;
    this.state = Object.freeze({
      resultsByForm: {} // formId → array of results
    });
    this.listeners = [];
  }

  connect(eventBus) {
    this.eventBus = eventBus;
  }

  subscribe(id, listener) {
    this.listeners.push({ id, listener });
    listener({ state: this.state, diff: null });
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

    this.eventBus?.emit("resultsStore:changed", { state: this.state, diff });
  }

  computeDiff(prev, next) {
    const diff = { resultsChanged: [] };
    for (const formId of Object.keys(next.resultsByForm)) {
      if (prev.resultsByForm[formId] !== next.resultsByForm[formId]) {
        diff.resultsChanged.push(formId);
      }
    }
    return diff;
  }
}