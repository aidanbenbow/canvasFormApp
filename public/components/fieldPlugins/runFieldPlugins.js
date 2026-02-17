export function runFieldPlugins(fields, plugins = [], context = {}) {
  let next = Array.isArray(fields) ? [...fields] : [];

  for (const plugin of plugins) {
    if (typeof plugin !== 'function') continue;
    const transformed = plugin(next, context);
    if (Array.isArray(transformed)) {
      next = transformed;
    }
  }

  return next;
}