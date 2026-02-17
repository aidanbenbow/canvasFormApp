import {
  getCompactSubmitStyle,
  getCopyButtonStyle,
  getResponsiveViewport
} from './screenManifestUtils.js';

export const formViewUIManifest = {
  layout: 'centre',
  id: 'form-view-root',
  style: {
    background: '#ffffff'
  },
  regions: {
    formContainer: {
      type: 'container',
      scrollable: true,
      viewport: 600,
      style: {
        background: '#f9f9f9'
      },
      children: []
    }
  }
};

export function buildViewFormManifest({
  fields,
  shouldAddCopyButton,
  ensureCopyCommand,
  isPhotoLikeField,
  getPhotoSource
}) {
  const manifest = structuredClone(formViewUIManifest);
  manifest.regions.formContainer.viewport = getResponsiveViewport();

  const compactSubmitStyle = getCompactSubmitStyle();
  const copyButtonStyle = getCopyButtonStyle();

  const normalizedChildren = [];
  for (const field of fields || []) {
    if (isPhotoLikeField(field)) {
      const source = getPhotoSource(field);
      const previewId = `photo-preview-${field.id}`;

      normalizedChildren.push({
        ...field,
        type: 'input',
        value: source,
        placeholder: field.placeholder || 'Enter photo URL...'
      });

      normalizedChildren.push({
        type: 'photo',
        id: previewId,
        src: source,
        style: {
          fillWidth: true,
          borderColor: '#93c5fd',
          backgroundColor: '#eff6ff'
        }
      });
      continue;
    }

    if (shouldAddCopyButton(field)) {
      const copyCommand = ensureCopyCommand(field.id);
      normalizedChildren.push(field);
      normalizedChildren.push({
        type: 'button',
        id: `copy-${field.id}`,
        label: 'Copy',
        action: copyCommand,
        skipCollect: true,
        skipClear: true,
        style: copyButtonStyle
      });
      continue;
    }

    if (field?.type === 'button' && !field.action && !field.command) {
      normalizedChildren.push({
        ...field,
        action: 'form.submit',
        style: {
          ...(field.style || {}),
          ...compactSubmitStyle
        }
      });
    } else if (field?.type === 'button') {
      normalizedChildren.push({
        ...field,
        style: {
          ...(field.style || {}),
          ...compactSubmitStyle
        }
      });
    } else {
      normalizedChildren.push(field);
    }
  }

  manifest.regions.formContainer.children = normalizedChildren;
  return manifest;
}