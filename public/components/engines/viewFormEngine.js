import { normalizeFields } from '../../utils/normalizeFields.js';
import { buildViewFormManifest } from '../manifests/viewFormManifest.js';
import { getResponsiveViewport } from '../manifests/screenManifestUtils.js';
import { compileUIManifest } from '../uiManifestCompiler.js';
import { BaseScreenEngine } from './baseScreenEngine.js';
import { CommandLifecycleFeature } from './features/commandLifecycleFeature.js';
import { CopyFieldFeature } from './features/copyFieldFeature.js';
import { PhotoPreviewFeature } from './features/photoPreviewFeature.js';
import { ViewStatsFeature } from './features/viewStatsFeature.js';

export class ViewFormEngine extends BaseScreenEngine {
  constructor({ id = 'form-view', context, store, factories, commandRegistry, results, formId, router }) {
    super({ id, context });
    this.store = store;
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.router = router || this.context?.screenRouter;

    const activeForm = this.store.getActiveForm?.() || null;
    this.formId = formId ?? activeForm?.formId ?? activeForm?.id ?? null;
    this.formStructure = activeForm?.formStructure || activeForm?.fields || {};
    this.fields = normalizeFields(this.formStructure);

    this.saveBrightnessCommand = `${this.id}.saveBrightness`;
    this.closeCommand = `${this.id}.close`;

    this.copyFieldFeature = new CopyFieldFeature({
      context: this.context,
      commandRegistry: this.commandRegistry,
      screenId: this.id
    });

    this.photoPreviewFeature = new PhotoPreviewFeature({
      engine: this,
      context: this.context,
      fields: this.fields
    });

    this.viewStatsFeature = new ViewStatsFeature({
      context: this.context,
      getResults: () => this.results
    });

    this.commandLifecycleFeature = new CommandLifecycleFeature({
      onAttach: () => {
        this.commandRegistry.register(this.saveBrightnessCommand, ({ fieldId } = {}) => {
          this.photoPreviewFeature.commitBrightness(fieldId);
        });

        this.commandRegistry.register(this.closeCommand, () => {
          this.router?.pop?.();
        });
      },
      onDetach: () => {
        this.commandRegistry?.unregister?.(this.saveBrightnessCommand);
        this.commandRegistry?.unregister?.(this.closeCommand);
      }
    });

    this.modules = [
      this.commandLifecycleFeature,
      this.photoPreviewFeature,
      this.copyFieldFeature,
      this.viewStatsFeature
    ];

    this.lifecycleModules = [this.commandLifecycleFeature];
    this.uiModules = [
      this.photoPreviewFeature,
      this.copyFieldFeature,
      this.viewStatsFeature
    ];

    this.manifest = buildViewFormManifest({
      fields: this.fields,
      closeCommand: this.closeCommand,
      shouldAddCopyButton: (field) => this.copyFieldFeature.shouldAddCopyButton(field),
      ensureCopyCommand: (fieldId) => this.copyFieldFeature.ensureCopyCommand(fieldId),
      isPhotoLikeField: (field) => this.photoPreviewFeature.isPhotoLikeField(field),
      getPhotoSource: (field) => this.photoPreviewFeature.getPhotoSource(field),
      saveBrightnessAction: this.saveBrightnessCommand
    });

    this.results = Array.isArray(results)
      ? results
      : (this.formId ? this.store.getFormResults(this.formId) : []);
  }

  mount() {
    this.buildUI();
    super.mount();
    this.attachModules(this.uiModules);
    return this.rootNode;
  }

  buildUI() {
    this.manifest.regions.formContainer.viewport = getResponsiveViewport();
    const effectiveResults = Array.isArray(this.results)
      ? this.results
      : (this.formId ? this.store.getFormResults(this.formId) : []);

    const { rootNode, regions } = compileUIManifest(
      this.manifest,
      this.factories,
      this.commandRegistry,
      this.context,
      effectiveResults
    );

    this.rootNode = rootNode;
    this.regions = regions;
    this.results = effectiveResults;
  }
}
