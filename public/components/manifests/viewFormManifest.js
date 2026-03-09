import {
  getCompactSubmitStyle,
  getCopyButtonStyle,
  getResponsiveViewport
} from './screenManifestUtils.js';
import {
  containerRegion,
  defineManifest
} from './manifestDsl.js';
import { buildToolbar } from './toolbarBuilder.js';
import { getFieldPlugins } from '../fieldPlugins/fieldPluginRegistry.js';
import { runFieldPlugins } from '../fieldPlugins/runFieldPlugins.js';

export const formViewUIManifest = defineManifest({
  layout: 'vertical',
  id: 'form-view-root',
  style: {
    background: '#ffffff'
  },
  regions: {
    toolbar: containerRegion({
      layout: 'horizontal',
      style: {
        background: '#f3f4f6',
        border: { color: '#d1d5db', width: 1 }
      },
      children: []
    }),
    formContainer: containerRegion({
      scrollable: true,
      viewport: 600,
      style: {
        background: '#f9f9f9'
      },
      children: []
    })
  }
});

export function buildViewFormManifest({
  fields,
  closeCommand,
  shouldAddCopyButton,
  ensureCopyCommand,
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction,
  toolbarPluginButtons = []
}) {
  const manifest = structuredClone(formViewUIManifest);
  manifest.regions.formContainer.viewport = getResponsiveViewport();

  manifest.regions.toolbar.children = buildToolbar(
    [
      closeCommand && { id: 'form-view-close', label: 'Close', action: closeCommand }
    ],
    toolbarPluginButtons
  );

  const compactSubmitStyle = getCompactSubmitStyle();
  const copyButtonStyle = getCopyButtonStyle();
  const plugins = getFieldPlugins('view', {
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction,
    shouldAddCopyButton,
    ensureCopyCommand,
    copyButtonStyle,
    submitStyle: compactSubmitStyle,
    submitAction: 'form.submit'
  });

  const normalizedChildren = runFieldPlugins(fields || [], plugins);

  manifest.regions.formContainer.children = normalizedChildren;
  return manifest;
}