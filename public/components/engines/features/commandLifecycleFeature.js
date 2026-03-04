export class CommandLifecycleFeature {
  constructor({ onAttach, onDetach } = {}) {
    this.onAttach = onAttach;
    this.onDetach = onDetach;
    this.isAttached = false;
  }

  attach() {
    if (this.isAttached) return;
    this.onAttach?.();
    this.isAttached = true;
  }

  detach() {
    if (!this.isAttached) return;
    this.onDetach?.();
    this.isAttached = false;
  }
}
