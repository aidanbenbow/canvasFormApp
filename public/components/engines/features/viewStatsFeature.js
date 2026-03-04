export class ViewStatsFeature {
  constructor({ context, getResults }) {
    this.context = context;
    this.getResults = getResults;
  }

  attach() {
    this.updateDefacut();
  }

  detach() {}

  updateDefacut() {
    const results = this.getResults?.() || [];
    const remaining = results.filter((r) => r.done !== true).length;

    const node = this.context?.fieldRegistry?.get('defacut-text');
    if (!node) return;

    node.text = String(remaining);
    node.invalidate?.();
  }
}
