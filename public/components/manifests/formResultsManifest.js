import { buttonNode, containerRegion, defineManifest, textNode } from './manifestDsl.js';

const toolbarButtonStyle = { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 };

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

export function buildResultRows(results = [], form = null, { getArticleOpenCommand, getArticleEditCommand } = {}) {
  const normalizedResults = Array.isArray(results) ? results : [];

  if (String(form?.resultsTable || '').trim().toLowerCase() === 'dorcasusers') {
    return buildArticleTitleRows(normalizedResults, { getArticleOpenCommand, getArticleEditCommand });
  }

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
    rows.push(
      textNode({
        id: `result-block-${index}`,
        text: buildResultBlockText(result, index),
        style: { font: '18px sans-serif', color: '#1f2937' }
      })
    );
  });

  return rows;
}

function buildArticleTitleRows(results = [], { getArticleOpenCommand, getArticleEditCommand } = {}) {
  const normalizedResults = Array.isArray(results) ? results : [];

  if (!normalizedResults.length) {
    return [
      textNode({
        id: 'results-empty-articles',
        text: 'No articles found.',
        style: { font: '20px sans-serif', color: '#6b7280' }
      })
    ];
  }

  const rows = [
    textNode({
      id: 'results-articles-count',
      text: `Total articles: ${normalizedResults.length}`,
      style: { font: '18px sans-serif', color: '#4b5563' }
    })
  ];

  normalizedResults.forEach((article, index) => {
    const openCommand =
      typeof getArticleOpenCommand === 'function'
        ? getArticleOpenCommand(article, index)
        : null;
    const editCommand =
      typeof getArticleEditCommand === 'function'
        ? getArticleEditCommand(article, index)
        : null;

    if (!openCommand) {
      rows.push(
        textNode({
          id: `article-title-${index}`,
          text: `${index + 1}. ${resolveArticleTitle(article, index)}`,
          style: { font: '18px sans-serif', color: '#2563eb' }
        })
      );
      return;
    }

    rows.push(
      buttonNode({
        id: `article-title-${index}`,
        label: `${index + 1}. ${resolveArticleTitle(article, index)}`,
        action: openCommand,
        style: {
          fillWidth: false,
          font: '18px sans-serif',
          color: '#2563eb',
          paddingX: 0,
          paddingY: 4
        },
        skipCollect: true,
        skipClear: true
      })
    );

    if (editCommand) {
      rows.push(
        buttonNode({
          id: `article-edit-${index}`,
          label: `Edit ${index + 1}`,
          action: editCommand,
          style: {
            fillWidth: false,
            font: '16px sans-serif',
            color: '#4b5563',
            paddingX: 0,
            paddingY: 2
          },
          skipCollect: true,
          skipClear: true
        })
      );
    }
  });

  return rows;
}

function resolveArticleTitle(article, index) {
  const candidates = [
    article?.title,
    article?.headline,
    article?.name,
    article?.userId
  ];

  for (const value of candidates) {
    const normalized = String(value || '').trim();
    if (normalized) return normalized;
  }

  return `Untitled article ${index + 1}`;
}

function buildResultBlockText(result, index) {
  const user = result?.user ? ` • ${result.user}` : '';
  const timestamp = formatTimestamp(result?.timestamp || result?.createdAt || null);
  const heading = `#${index + 1}${timestamp ? ` • ${timestamp}` : ''}${user}`;
  const inputEntries = Object.entries(extractInputMap(result));

  if (!inputEntries.length) {
    return `${heading}\n  (no input values)`;
  }

  const body = inputEntries
    .map(([key, value]) => `  ${key}: ${formatValue(value)}`)
    .join('\n');

  return `${heading}\n${body}`;
}

function extractInputMap(result) {
  if (!result || typeof result !== 'object') return {};

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
