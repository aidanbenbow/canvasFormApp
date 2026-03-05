const pipelineRegistry = new WeakMap();

export class EventCapturePipeline {
  constructor(container) {
    this.container = container;
    this.handlers = [];

    this.originalCapture = container.onEventCapture?.bind(container) ?? null;

    container.onEventCapture = (event) => {
      if (this.originalCapture?.(event)) return true;

      const orderedHandlers = [...this.handlers].sort(
        (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
      );

      for (const handler of orderedHandlers) {
        if (handler.types && !handler.types.includes(event.type)) continue;

        try {
          if (handler.fn(event)) return true;
        } catch (err) {
          console.error('Pipeline handler error:', err);
        }
      }

      return false;
    };
  }

  static forContainer(container) {
    if (!container) return null;
    let pipeline = pipelineRegistry.get(container);
    if (!pipeline) {
      pipeline = new EventCapturePipeline(container);
      pipelineRegistry.set(container, pipeline);
    }
    return pipeline;
  }

  use(fn, options = {}) {
    const handler = {
      fn,
      priority: options.priority ?? 0,
      types: options.types ?? null,
      session: options.session ?? false
    };

    this.handlers.push(handler);

    return () => {
      const index = this.handlers.indexOf(handler);
      if (index !== -1) this.handlers.splice(index, 1);
    };
  }

  useSession(fn, options = {}) {
    return this.use(fn, { ...options, session: true, priority: 100 });
  }

  clearSessionHandlers() {
    this.handlers = this.handlers.filter((handler) => !handler.session);
  }

  clear() {
    this.handlers.length = 0;
  }

  destroy() {
    if (this.container) {
      this.container.onEventCapture = this.originalCapture;
    }

    this.clear();
    pipelineRegistry.delete(this.container);
  }
}