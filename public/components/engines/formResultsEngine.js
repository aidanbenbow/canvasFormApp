import { compileUIManifest } from '../uiManifestCompiler.js';
import { buildResultRows, buildResultsManifest } from '../manifests/formResultsManifest.js';

export class FormResultsEngine {
  constructor({
    id = 'formResults',
    context,
    store,
    factories,
    commandRegistry,
    router,
    results
  }) {
    this.id = id;
    this.context = context;
    this.store = store;
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.router = router;
    this.form = this.store.getActiveForm();
    this.results = Array.isArray(results)
      ? results
      : this.store.getFormResults(this.form?.formId);

    this.closeCommand = `${this.id}.close`;
    this.articleOpenCommands = new Set();
    this.articleEditCommands = new Set();
  }

  mount() {
    this.commandRegistry.register(this.closeCommand, () => {
      this.router?.pop?.();
    });

    if (String(this.form?.resultsTable || '').trim().toLowerCase() === 'dorcasusers') {
      this.registerArticleArticleCommands(this.results);
    }

    const manifest = buildResultsManifest({
      form: this.form,
      closeCommand: this.closeCommand,
      rows: buildResultRows(this.results, this.form, {
        getArticleOpenCommand: (article, index) => this.getArticleOpenCommandName(article, index),
        getArticleEditCommand: (article, index) => this.getArticleEditCommandName(article, index)
      })
    });

    const { rootNode, regions } = compileUIManifest(
      manifest,
      this.factories,
      this.commandRegistry,
      this.context
    );

    this.rootNode = rootNode;
    this.regions = regions;

    return rootNode;
  }

  destroy() {
    this.commandRegistry?.unregister?.(this.closeCommand);

    for (const commandName of this.articleOpenCommands) {
      this.commandRegistry?.unregister?.(commandName);
    }
    this.articleOpenCommands.clear();

    for (const commandName of this.articleEditCommands) {
      this.commandRegistry?.unregister?.(commandName);
    }
    this.articleEditCommands.clear();
  }

  registerArticleArticleCommands(results = []) {
    const normalizedResults = Array.isArray(results) ? results : [];

    normalizedResults.forEach((article, index) => {
      const openCommand = this.getArticleOpenCommandName(article, index);
      const editCommand = this.getArticleEditCommandName(article, index);
      if (!openCommand || !editCommand) return;

      this.commandRegistry.register(openCommand, () => {
        const articleId = String(article?.userId || '').trim();
        if (!articleId) return;

        const encodedArticleId = encodeURIComponent(articleId);
        window.open(`/?articleId=${encodedArticleId}`, '_blank', 'noopener,noreferrer');
      });
      this.articleOpenCommands.add(openCommand);

      this.commandRegistry.register(editCommand, () => {
        const articleId = String(article?.userId || '').trim();
        if (!articleId) return;

        const encodedArticleId = encodeURIComponent(articleId);
        window.open(`/?articleId=${encodedArticleId}&mode=edit`, '_blank', 'noopener,noreferrer');
      });
      this.articleEditCommands.add(editCommand);
    });
  }

  getArticleOpenCommandName(article, index) {
    const articleId = String(article?.userId || '').trim();
    if (!articleId) return null;

    const normalizedId = articleId.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `${this.id}.openArticle.${normalizedId}.${index}`;
  }

  getArticleEditCommandName(article, index) {
    const articleId = String(article?.userId || '').trim();
    if (!articleId) return null;

    const normalizedId = articleId.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `${this.id}.editArticle.${normalizedId}.${index}`;
  }
}
