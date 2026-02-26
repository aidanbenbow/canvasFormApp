 
// public/stores/ArticlesStore.js

export class ArticlesStore {
  constructor() {
    this.state = Object.freeze({ articles: {} });
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  subscribe(id, listener) {
    this.listeners.push({ id, listener });
    return () => this.unsubscribe(id);
  }

  unsubscribe(id) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  // Accepts a *new immutable state* and emits diffs
  apply(nextState) {
    const prev = this.state;
    this.state = Object.freeze(nextState);

    const diff = {
      added: [],
      updated: [],
      removed: []
    };

    const prevMap = prev.articles;
    const nextMap = nextState.articles;

    for (const id of Object.keys(nextMap)) {
      if (!prevMap[id]) diff.added.push(nextMap[id]);
      else if (prevMap[id].updatedAt !== nextMap[id].updatedAt)
        diff.updated.push(nextMap[id]);
    }

    for (const id of Object.keys(prevMap)) {
      if (!nextMap[id]) diff.removed.push(id);
    }

    for (const { listener } of this.listeners) {
      listener({ state: this.state, diff });
    }
  }
}
