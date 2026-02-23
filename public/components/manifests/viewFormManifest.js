import {
  getCompactSubmitStyle,
  getCopyButtonStyle,
  getResponsiveViewport
} from './screenManifestUtils.js';
import {
  containerRegion,
  defineManifest
} from './manifestDsl.js';
import { getFieldPlugins } from '../fieldPlugins/fieldPluginRegistry.js';
import { runFieldPlugins } from '../fieldPlugins/runFieldPlugins.js';

export const formViewUIManifest = defineManifest({
  layout: 'centre',
  id: 'form-view-root',
  style: {
    background: '#ffffff'
  },
  regions: {
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
  shouldAddCopyButton,
  ensureCopyCommand,
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction
}) {
  const manifest = structuredClone(formViewUIManifest);
  manifest.regions.formContainer.viewport = getResponsiveViewport();

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