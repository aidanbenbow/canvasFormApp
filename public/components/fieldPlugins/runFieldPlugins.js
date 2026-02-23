export function runFieldPlugins(fields, plugins = [], context = {}) {
  let next = Array.isArray(fields) ? [...fields] : [];

  for (const plugin of plugins) {
    if (!plugin) continue;

    if (typeof plugin === 'function') {
      const transformed = plugin(next, context);
      if (Array.isArray(transformed)) {
        next = transformed;
      }
      continue;
    }

    if (typeof plugin.transformFields === 'function') {
      const transformed = plugin.transformFields(next, context);
      if (Array.isArray(transformed)) {
        next = transformed;
      }
      continue;
    }

    if (typeof plugin.transform === 'function') {
      const transformedFields = [];

      for (const field of next) {
        const transformed = plugin.transform(field, context);
        if (Array.isArray(transformed)) {
          transformedFields.push(...transformed.filter(Boolean));
          continue;
        }

        if (transformed != null) {
          transformedFields.push(transformed);
        }
      }

      next = transformedFields;
    }
  }

  return next;
}