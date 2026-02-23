import {
  getCompactToolbarButtonStyle,
  getDeleteButtonStyle,
  isSmallScreen
} from './screenManifestUtils.js';
import { normalizeEditorFields } from './editor/fieldNormalization.js';
import { getFieldPlugins } from '../fieldPlugins/fieldPluginRegistry.js';
import { runFieldPlugins } from '../fieldPlugins/runFieldPlugins.js';

export const createFormUIManifest = {
  layout: 'vertical',
  id: 'create-form-root',
  style: {
    background: '#ffffff'
  },
  regions: {
    toolbar: {
      type: 'container',
      layout: 'horizontal',
      style: {
        background: '#f3f4f6',
        border: { color: '#d1d5db', width: 1 }
      },
      children: []
    },
    formContainer: {
      type: 'container',
      scrollable: true,
      viewport: 600,
      children: []
    }
  }
};

export function buildCreateFormManifest({
  mode,
  saveCommand,
  addTextCommand,
  addLabelCommand,
  addInputCommand,
  addPhotoCommand,
  displayFields
}) {
  const manifest = structuredClone(createFormUIManifest);
  manifest.id = mode === 'edit' ? 'edit-form-root' : 'create-form-root';

  const compactButtonStyle = getCompactToolbarButtonStyle();
  manifest.regions.toolbar.children = [
    {
      type: 'button',
      id: 'save',
      label: mode === 'edit' ? 'Update Form' : 'Save Form',
      action: saveCommand,
      style: compactButtonStyle,
      skipCollect: true,
      skipClear: true
    },
    {
      type: 'button',
      id: 'addText',
      label: 'Add Text',
      action: addTextCommand,
      style: compactButtonStyle,
      skipCollect: true,
      skipClear: true
    },
    {
      type: 'button',
      id: 'addLabel',
      label: 'Add Label',
      action: addLabelCommand,
      style: compactButtonStyle,
      skipCollect: true,
      skipClear: true
    },
    {
      type: 'button',
      id: 'addInput',
      label: 'Add Input',
      action: addInputCommand,
      style: compactButtonStyle,
      skipCollect: true,
      skipClear: true
    },
    {
      type: 'button',
      id: 'addPhoto',
      label: 'Add Photo',
      action: addPhotoCommand,
      style: compactButtonStyle,
      skipCollect: true,
      skipClear: true
    }
  ];

  manifest.regions.formContainer.children = displayFields;
  return manifest;
}

export function buildCreateDisplayFields({
  fields,
  editorState,
  deleteFieldCommand,
  getDragHandlePresentation,
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction
}) {
  const { mode, selectedFieldId, draggingFieldId } = editorState || {};
  const smallScreen = isSmallScreen();
  const deleteButtonStyle = getDeleteButtonStyle();
  const fieldPlugins = getFieldPlugins(mode, {
    selectedFieldId,
    deleteFieldCommand,
    getDragHandlePresentation,
    deleteButtonStyle,
    smallScreen,
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction
  });
  const normalizedFields = normalizeEditorFields(fields, {
    mode,
    selectedFieldId,
    draggingFieldId
  });
  return runFieldPlugins(normalizedFields, fieldPlugins);
}