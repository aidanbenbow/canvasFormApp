import { normalizeFields } from '../../utils/normalizeFields.js';
import { buttonNode, containerRegion, defineManifest, textNode } from './manifestDsl.js';

const toolbarButtonStyle = { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 };

export function buildFormResultEditorManifest({ form, result, resultIndex, closeCommand, saveCommand, resultId }) {
  const title = `Edit Result #${Number.isInteger(resultIndex) ? resultIndex + 1 : 1}`;
  const fields = normalizeFields(form?.formStructure || form?.fields || []);
  const valueMap = extractInputMap(result);
  const children = buildEditorChildren(fields, valueMap);

  return defineManifest({
    layout: 'vertical',
    id: 'result-editor-root',
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
        children: [
          buttonNode({
            id: 'result-editor-save',
            label: 'Save',
            action: saveCommand,
            payload: {
              resultIndex,
              resultId
            },
            style: toolbarButtonStyle,
            skipCollect: false,
            skipClear: true
          }),
          buttonNode({
            id: 'result-editor-close',
            label: 'Back',
            action: closeCommand,
            style: toolbarButtonStyle,
            skipCollect: true,
            skipClear: true
          })
        ]
      }),
      form: containerRegion({
        scrollable: true,
        viewport: 620,
        style: { background: '#ffffff' },
        children: [
          textNode({
            id: 'result-editor-title',
            text: title,
            style: { font: '20px sans-serif', color: '#111827' }
          }),
          ...children
        ]
      })
    }
  });
}

function buildEditorChildren(formFields, valueMap) {
  const editableFields = (Array.isArray(formFields) ? formFields : [])
    .filter((field) => isEditableFieldType(field?.type));

  if (!editableFields.length) {
    return [
      textNode({
        id: 'result-editor-no-fields',
        text: 'No editable input fields found in current form structure.',
        style: { font: '18px sans-serif', color: '#6b7280' }
      })
    ];
  }

  return editableFields.flatMap((field, index) => {
    const fieldId = resolveFieldId(field, index);
    const label = resolveFieldLabel(field, index);
    const value = formatValue(valueMap[fieldId]);

    const editorDef = buildEditableDefinition(field, fieldId, value);

    return [
      textNode({
        id: `result-editor-label-${fieldId}`,
        text: label,
        style: { font: '18px sans-serif', color: '#4b5563' }
      }),
      editorDef
    ];
  });
}

function buildEditableDefinition(field, fieldId, value) {
  const baseId = `result-editor-${fieldId}`;

  if (field?.type === 'dropDown') {
    return {
      type: 'dropDown',
      id: baseId,
      value,
      placeholder: field?.placeholder || 'Select value',
      options: Array.isArray(field?.options) ? field.options : [],
      style: { ...(field?.style || {}) }
    };
  }

  return {
    type: 'input',
    id: baseId,
    value,
    placeholder: field?.placeholder || '',
    style: { ...(field?.style || {}) }
  };
}

function isEditableFieldType(type) {
  return type === 'input' || type === 'dropDown' || type === 'photo';
}

function resolveFieldId(field, index) {
  const id = String(field?.id || '').trim();
  if (id) return id;
  return `field-${index + 1}`;
}

function resolveFieldLabel(field, index) {
  const candidates = [field?.label, field?.text, field?.placeholder, field?.id];
  for (const value of candidates) {
    const normalized = String(value || '').trim();
    if (normalized) return normalized;
  }

  return `Field ${index + 1}`;
}

function extractInputMap(result) {
  if (!result || typeof result !== 'object') return {};

  if (result.payload && typeof result.payload === 'object' && !Array.isArray(result.payload)) {
    return result.payload;
  }

  if (result.inputs && typeof result.inputs === 'object' && !Array.isArray(result.inputs)) {
    return result.inputs;
  }

  if (result.fields && typeof result.fields === 'object' && !Array.isArray(result.fields)) {
    return result.fields;
  }

  if (result.responses && typeof result.responses === 'object' && !Array.isArray(result.responses)) {
    return result.responses;
  }

  return {};
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
