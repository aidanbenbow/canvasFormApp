import {
  getCompactToolbarButtonStyle,
  getDeleteButtonStyle,
  isSmallScreen
} from './screenManifestUtils.js';
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
  mode,
  selectedFieldId,
  draggingFieldId,
  deleteFieldCommand,
  getDragHandlePresentation,
  isPhotoLikeField,
  getPhotoSource,
  saveBrightnessAction
}) {
  const smallScreen = isSmallScreen();
  const deleteButtonStyle = getDeleteButtonStyle();
  const fieldPlugins = getFieldPlugins(mode, {
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction
  });

  return (fields || []).flatMap((field) => {
    const def = structuredClone(field);
    const nodes = [];
    const isSelected = selectedFieldId === def.id;

    if (def.type === 'text' && def.text == null) {
      def.text = def.label || 'Text';
    }

    if (def.type === 'button') {
      def.label = def.label || 'Submit';
      delete def.action;
      delete def.command;
    }

    if (mode === 'edit' && (def.type === 'input' || def.type === 'photo')) {
      def.editable = false;
    }

    if ((def.type === 'text' || def.type === 'label') && isSelected) {
      def.editable = true;
    }

    def.style = {
      ...(def.style || {}),
      borderColor: isSelected ? '#0078ff' : (def.style?.borderColor || '#ccc'),
      backgroundColor: draggingFieldId === def.id ? '#e0f2fe' : def.style?.backgroundColor,
      opacity: draggingFieldId === def.id ? 0.8 : (def.style?.opacity ?? 1)
    };

    if (isSelected) {
      nodes.push({
        type: 'text',
        id: `drag-handle-${def.id}`,
        ...getDragHandlePresentation(def.id, { smallScreen })
      });
    }

    const normalizedFieldNodes = runFieldPlugins([def], fieldPlugins);
    nodes.push(...normalizedFieldNodes);

    if (isSelected) {
      nodes.push({
        type: 'button',
        id: `delete-${def.id}`,
        label: '✖',
        action: deleteFieldCommand,
        payload: { fieldId: def.id },
        style: {
          textColor: '#ffffff',
          background: '#dc2626',
          hoverBackground: '#b91c1c',
          pressedBackground: '#991b1b',
          borderColor: '#7f1d1d',
          fillWidth: false,
          paddingX: 0,
          paddingY: 0,
          ...deleteButtonStyle
        },
        skipCollect: true,
        skipClear: true
      });
    }

    return nodes;
  });
}