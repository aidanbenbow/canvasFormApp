import { compileUIManifest } from '../uiManifestCompiler.js';
import { buildDefaultResultRows, buildResultsManifest } from '../manifests/formResultsManifest.js';
import { dorcasArticleBehavior, noopArticleBehavior } from './behaviors/articleBehavior.js';
import { tableAwareResultRowsBehavior } from './behaviors/resultRowsBehavior.js';

export class FormResultsEngine {
  constructor({
    id = 'formResults',
    context,
    store,
    factories,
    commandRegistry,
    router,
    results,
    articleBehavior,
    resultRowsBehavior
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
    this.articleBehavior = articleBehavior ?? dorcasArticleBehavior ?? noopArticleBehavior;
    this.resultRowsBehavior = resultRowsBehavior ?? tableAwareResultRowsBehavior;

    this.closeCommand = `${this.id}.close`;
    this.openArticleCommand = `${this.id}.openArticle`;
  }

  mount() {
    this.commandRegistry.register(this.closeCommand, () => {
      this.router?.pop?.();
    });

    if (this.articleBehavior?.shouldHandle?.(this.form)) {
      this.articleBehavior.registerCommands(this, this.results);
    }

    const manifest = buildResultsManifest({
      form: this.form,
      closeCommand: this.closeCommand,
      rows:
        this.resultRowsBehavior?.buildRows?.(this, this.results, this.form) ??
        buildDefaultResultRows(this.results, this.form)
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
    this.articleBehavior?.unregisterCommands?.(this);
  }
}
