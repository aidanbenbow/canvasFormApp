import { ensureSubmitActionPlugin } from './ensureSubmitActionPlugin.js';
import { injectCopyButtonPlugin } from './injectCopyButtonPlugin.js';
import { injectPhotoPreviewPlugin } from './injectPhotoPreviewPlugin.js';
import { FIELD_PLUGIN_MODE_CONFIG } from './fieldPluginConfig.js';

/**
 * @typedef {import('./fieldPluginConfig.js').FieldPluginMode} FieldPluginMode
 * @typedef {import('./fieldPluginConfig.js').FieldPluginConfigEntry} FieldPluginConfigEntry
 */

/**
 * @param {FieldPluginMode} mode
 * @param {Object} [context]
 */
export function getFieldPlugins(mode, context = {}) {
  const {
    isPhotoLikeField,
    getPhotoSource,
    shouldAddCopyButton,
    ensureCopyCommand,
    copyButtonStyle,
    submitStyle,
    submitAction = 'form.submit',
    saveBrightnessAction = 'photo.preview.saveBrightness'
  } = context;

  const photoPreview = injectPhotoPreviewPlugin({
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction
  });

  const pluginFactories = {
    photoPreview: () => photoPreview,
    copyButton: () =>
      injectCopyButtonPlugin({
        shouldAddCopyButton,
        ensureCopyCommand,
        style: copyButtonStyle
      }),
    submitAction: () => ensureSubmitActionPlugin({ action: submitAction, style: submitStyle })
  };

  /** @type {(string | FieldPluginConfigEntry)[]} */
  const pluginEntries = FIELD_PLUGIN_MODE_CONFIG[mode] || [];

  return pluginEntries
    .map((entry) => {
      if (typeof entry === 'string') {
        return { key: entry, enabled: true };
      }

      return {
        key: entry?.key,
        enabled: entry?.enabled !== false
      };
    })
    .filter((entry) => entry.key && entry.enabled)
    .map((entry) => pluginFactories[entry.key])
    .filter(Boolean)
    .map((createPlugin) => createPlugin())
    .filter(Boolean);
}