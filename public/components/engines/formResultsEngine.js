import { compileUIManifest } from '../uiManifestCompiler.js';
import { buildDefaultResultRows, buildResultsManifest } from '../manifests/formResultsManifest.js';
import { dorcasArticleBehavior, noopArticleBehavior } from './behaviors/articleBehavior.js';
import { tableAwareResultRowsBehavior } from './behaviors/resultRowsBehavior.js';
import { CommandLifecycleFeature } from './features/commandLifecycleFeature.js';
import { BaseScreenEngine } from './baseScreenEngine.js';

export class FormResultsEngine extends BaseScreenEngine {
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
    super({ id, context });
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

    this.commandLifecycleFeature = new CommandLifecycleFeature({
      onAttach: () => {
        this.commandRegistry.register(this.closeCommand, () => {
          this.router?.pop?.();
        });

        if (this.articleBehavior?.shouldHandle?.(this.form)) {
          this.articleBehavior.registerCommands(this, this.results);
        }
      },
      onDetach: () => {
        this.commandRegistry?.unregister?.(this.closeCommand);
        this.articleBehavior?.unregisterCommands?.(this);
      }
    });

    this.modules = [this.commandLifecycleFeature];
    this.lifecycleModules = [this.commandLifecycleFeature];
  }

  mount() {
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

    return super.mount();
  }
}
