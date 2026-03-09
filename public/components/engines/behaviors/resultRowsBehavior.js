import { buttonNode, textNode } from '../../manifests/manifestDsl.js';
import { buildDefaultResultRows, buildDiffAwareResultRows } from '../../manifests/formResultsManifest.js';

export const defaultResultRowsBehavior = {
  buildRows(engine, results, form) {
    return buildDefaultResultRows(results, form, {
      openResultCommand: engine?.openResultCommand
    });
  }
};

export const diffAwareResultRowsBehavior = {
  buildRows(engine, results, form) {
    return buildDiffAwareResultRows(results, form, {
      openResultCommand: engine?.openResultCommand
    });
  }
};

export const dorcasResultRowsBehavior = {
  shouldHandle(form) {
    return String(form?.resultsTable || '').trim().toLowerCase() === 'dorcasusers';
  },
  buildRows(engine, results = []) {
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
      const articleId = String(article?.userId || '').trim();
      const openPayload = { articleId, mode: 'view' };
      const editPayload = { articleId, mode: 'edit' };

      if (!articleId) {
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
          action: engine.openArticleCommand,
          payload: openPayload,
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
            action: engine.openArticleCommand,
            payload: editPayload,
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
};

export const tableAwareResultRowsBehavior = {
  buildRows(engine, results, form) {
    if (dorcasResultRowsBehavior.shouldHandle(form)) {
      return dorcasResultRowsBehavior.buildRows(engine, results, form);
    }

    return diffAwareResultRowsBehavior.buildRows(engine, results, form);
  }
};

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
