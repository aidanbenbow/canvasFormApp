import {
  getDeleteButtonStyle,
  isSmallScreen
} from './screenManifestUtils.js';
import {
  containerRegion,
  defineManifest
} from './manifestDsl.js';
import { buildToolbar } from './toolbarBuilder.js';
import { normalizeEditorFields } from './editor/fieldNormalization.js';
import { getFieldPlugins } from '../fieldPlugins/fieldPluginRegistry.js';
import { runFieldPlugins } from '../fieldPlugins/runFieldPlugins.js';

export const createFormUIManifest = defineManifest({
  layout: 'vertical',
  id: 'create-form-root',
  style: {
    background: '#e35e5e'
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
      style: {
        background: '#ffffff'
      },
      scrollable: true,
      viewport: 600,
      children: []
    })
  }
});

export function buildCreateFormManifest({
  mode,
  saveCommand,
  addTextCommand,
  addLabelCommand,
  addInputCommand,
  addDropDownCommand,
  addDropDownOptionCommand,
  addPhotoCommand,
  closeCommand,
  displayFields,
  toolbarPluginButtons = []
}) {
  const manifest = structuredClone(createFormUIManifest);
  manifest.id = mode === 'edit' ? 'edit-form-root' : 'create-form-root';

  manifest.regions.toolbar.children = buildToolbar(
    [
      closeCommand && { id: 'close', label: 'Close', action: closeCommand },
      { id: 'save', label: mode === 'edit' ? 'Update Form' : 'Save Form', action: saveCommand },
      { id: 'addText', label: 'Add Text', action: addTextCommand },
      { id: 'addInput', label: 'Add Input', action: addInputCommand },
      { id: 'addDropDown', label: 'Add Dropdown', action: addDropDownCommand },
      { id: 'addDropDownOption', label: 'Add Option', action: addDropDownOptionCommand },
      { id: 'addPhoto', label: 'Add Photo', action: addPhotoCommand }
    ],
    toolbarPluginButtons
  );

  manifest.regions.formContainer.children = displayFields;
  return manifest;
}

export function buildCreateDisplayFields({
  fields,
  editorState,
  plugins,
  pluginContext,
  deleteFieldCommand,
  getDragHandlePresentation,
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction
}) {
  const { mode, selectedFieldId, draggingFieldId } = editorState || {};
  const smallScreen = isSmallScreen();
  const selectedField = (fields || []).find((field) => field?.id === selectedFieldId) || null;
  const selectedLabelBindingTarget =
    selectedField?.type === 'label' && typeof selectedField?.forFieldId === 'string'
      ? selectedField.forFieldId.trim()
      : '';
  const deleteButtonStyle = getDeleteButtonStyle();
  const executionContext = {
    ...(pluginContext || {}),
    mode,
    selectedFieldId,
    draggingFieldId,
    deleteFieldCommand,
    getDragHandlePresentation,
    deleteButtonStyle,
    smallScreen,
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction
  };
  const fieldPlugins = Array.isArray(plugins) && plugins.length
    ? plugins
    : getFieldPlugins(mode, executionContext);
  const normalizedFields = normalizeEditorFields(fields, {
    mode,
    selectedFieldId,
    draggingFieldId
  });
  const displayFields = runFieldPlugins(normalizedFields, fieldPlugins, executionContext);

  if (!selectedLabelBindingTarget) {
    return displayFields;
  }

  return [
    {
      id: `label-link-hint-${selectedFieldId}`,
      type: 'text',
      text: `Linked to: ${selectedLabelBindingTarget}`,
      style: {
        font: smallScreen ? "26px sans-serif" : "18px sans-serif",
        color: '#2563eb'
      }
    },
    ...displayFields
  ];
}