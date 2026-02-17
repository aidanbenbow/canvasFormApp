/** @type {const} */
export const FIELD_PLUGIN_KEYS = ['photoPreview', 'copyButton', 'submitAction'];

/**
 * @typedef {typeof FIELD_PLUGIN_KEYS[number]} FieldPluginKey
 */

/**
 * @typedef {Object} FieldPluginConfigEntry
 * @property {FieldPluginKey} key
 * @property {boolean} [enabled=true]
 */

/** @type {const} */
export const FIELD_PLUGIN_MODES = ['create', 'edit', 'view'];

/**
 * @typedef {typeof FIELD_PLUGIN_MODES[number]} FieldPluginMode
 */

/**
 * @type {Record<FieldPluginMode, FieldPluginConfigEntry[]>}
 */
export const FIELD_PLUGIN_MODE_CONFIG = {
  create: [{ key: 'photoPreview', enabled: true }],
  edit: [{ key: 'photoPreview', enabled: true }],
  view: [
    { key: 'photoPreview', enabled: true },
    { key: 'copyButton', enabled: true },
    { key: 'submitAction', enabled: true }
  ]
};