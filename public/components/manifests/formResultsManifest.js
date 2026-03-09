import { buttonNode, containerRegion, defineManifest, textNode } from './manifestDsl.js';

const toolbarButtonStyle = { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 };
const diffStatusStyles = {
  unchanged: { color: '#6b7280', label: ' (unchanged)' },
  changed: { color: '#ca8a04', label: ' (changed)' },
  added: { color: '#16a34a', label: ' (+ added)' },
  removed: { color: '#dc2626', label: ' (- removed)' }
};

export function buildResultsManifest({ form, closeCommand, rows }) {
  const title = `Results: ${form?.label || 'Form'}`;

  return defineManifest({
    layout: 'vertical',
    id: 'results-root',
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
            id: 'results-close',
            label: 'Close',
            action: closeCommand,
            style: toolbarButtonStyle,
            skipCollect: true,
            skipClear: true
          })
        ]
      }),
      results: containerRegion({
        scrollable: true,
        viewport: 620,
        style: {
          background: '#ffffff'
        },
        children: [
          textNode({
            id: 'results-title',
            text: title,
            style: { font: '20px sans-serif', color: '#111827' }
          }),
          ...rows
        ]
      })
    }
  });
}

export function buildDefaultResultRows(results = [], form = null, options = {}) {
  return buildDiffAwareResultRows(results, form, options);
}

export function buildDiffAwareResultRows(results = [], form = null, options = {}) {
  const normalizedResults = Array.isArray(results) ? results : [];
  const openResultCommand = options?.openResultCommand || null;

  if (!normalizedResults.length) {
    return [
      textNode({
        id: 'results-empty',
        text: 'No saved results for this form yet.',
        style: { font: '20px sans-serif', color: '#6b7280' }
      })
    ];
  }

  const rows = [];

  rows.push(
    textNode({
      id: 'results-count',
      text: `Total submissions: ${normalizedResults.length}`,
      style: { font: '18px sans-serif', color: '#4b5563' }
    })
  );

  normalizedResults.forEach((result, index) => {
    const previousResult = index > 0 ? normalizedResults[index - 1] : null;
    const resultId = resolveResultId(result, index);

    if (openResultCommand) {
      rows.push(
        buttonNode({
          id: `result-heading-${index}`,
          label: buildResultHeadingText(result, index),
          action: openResultCommand,
          payload: { resultIndex: index, resultId },
          style: {
            fillWidth: false,
            font: '18px sans-serif',
            color: '#1f2937',
            paddingX: 0,
            paddingY: 2
          },
          skipCollect: true,
          skipClear: true
        })
      );
    } else {
      rows.push(
        textNode({
          id: `result-heading-${index}`,
          text: buildResultHeadingText(result, index),
          style: { font: '18px sans-serif', color: '#1f2937' }
        })
      );
    }

    const fieldRows = buildDiffFieldRows(result, previousResult, index);
    rows.push(...fieldRows);
  });

  return rows;
}

function buildResultHeadingText(result, index) {
  const user = result?.user ? ` • ${result.user}` : '';
  const timestamp = formatTimestamp(result?.timestamp || result?.createdAt || null);
  return `#${index + 1}${timestamp ? ` • ${timestamp}` : ''}${user}`;
}

function buildDiffFieldRows(currentResult, previousResult, index) {
  const currentInputs = extractInputMap(currentResult);
  const previousInputs = extractInputMap(previousResult);
  const entries = buildDiffEntries(currentInputs, previousInputs);

  if (!entries.length) {
    return [
      textNode({
        id: `result-empty-${index}`,
        text: '  (no input values)',
        style: { font: '18px sans-serif', color: '#6b7280' },
        metadata: {
          kind: 'result-field',
          status: 'unchanged',
          key: null,
          hasValues: false,
          resultIndex: index
        }
      })
    ];
  }

  return entries.map((entry) => buildDiffFieldNode(entry, index));
}

function buildDiffEntries(currentInputs, previousInputs) {
  const keys = new Set([
    ...Object.keys(previousInputs || {}),
    ...Object.keys(currentInputs || {})
  ]);

  return [...keys]
    .sort((left, right) => left.localeCompare(right))
    .map((key) => {
      const hasCurrent = Object.prototype.hasOwnProperty.call(currentInputs, key);
      const hasPrevious = Object.prototype.hasOwnProperty.call(previousInputs, key);
      const currentValue = hasCurrent ? currentInputs[key] : undefined;
      const previousValue = hasPrevious ? previousInputs[key] : undefined;

      let status = 'unchanged';
      if (hasCurrent && !hasPrevious) {
        status = 'added';
      } else if (!hasCurrent && hasPrevious) {
        status = 'removed';
      } else if (!areValuesEqual(currentValue, previousValue)) {
        status = 'changed';
      }

      return {
        key,
        status,
        value: status === 'removed' ? previousValue : currentValue,
        previousValue,
        currentValue
      };
    });
}

function buildDiffFieldNode(entry, resultIndex) {
  const statusStyle = diffStatusStyles[entry.status] || diffStatusStyles.unchanged;
  const valueLabel = formatValue(entry.value);
  const prefix = `  ${entry.key}: ${valueLabel}`;

  return textNode({
    id: `result-field-${resultIndex}-${sanitizeKey(entry.key)}`,
    runs: [
      { text: prefix, color: '#1f2937' },
      { text: statusStyle.label, color: statusStyle.color }
    ],
    style: { font: '18px sans-serif', color: '#1f2937' },
    metadata: {
      kind: 'result-field',
      status: entry.status,
      key: entry.key,
      previousValue: entry.previousValue,
      currentValue: entry.currentValue,
      resultIndex
    }
  });
}

function sanitizeKey(key) {
  return String(key || 'field').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function resolveResultId(result, index) {
  const idCandidates = [
    result?.id,
    result?.resultId,
    result?.submissionId,
    result?.userId,
    result?.pk
  ];

  for (const candidate of idCandidates) {
    const normalized = String(candidate ?? '').trim();
    if (normalized) return normalized;
  }

  return `result-${index}`;
}

function areValuesEqual(left, right) {
  if (left === right) return true;

  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return String(left) === String(right);
  }
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

  const excluded = new Set(['id', 'formId', 'user', 'timestamp', 'createdAt', 'updatedAt']);
  return Object.fromEntries(
    Object.entries(result).filter(([key, value]) => {
      if (excluded.has(key)) return false;
      if (value === null || value === undefined) return false;
      return typeof value !== 'object' || Array.isArray(value);
    })
  );
}

function formatTimestamp(value) {
  if (value === null || value === undefined) return '';

  const numeric = Number(value);
  const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
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
