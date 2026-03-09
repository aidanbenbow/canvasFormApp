import { compileUIManifest } from '../uiManifestCompiler.js';
import { buildFormResultEditorManifest } from '../manifests/formResultEditorManifest.js';
import { BaseScreenEngine } from './baseScreenEngine.js';
import { CommandLifecycleFeature } from './features/commandLifecycleFeature.js';
import { formResultsRepository } from '../../repositories/formResultsRepository.js';

export class FormResultEditorEngine extends BaseScreenEngine {
  constructor({
    id = 'formResultEditor',
    context,
    store,
    factories,
    commandRegistry,
    router,
    form,
    result,
    resultIndex
  }) {
    super({ id, context });

    this.store = store;
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.router = router || this.context?.screenRouter;
    this.form = form || this.store.getActiveForm?.() || null;
    this.result = result || null;
    this.resultIndex = Number.isInteger(resultIndex) ? resultIndex : 0;

    this.closeCommand = `${this.id}.close`;
    this.saveCommand = `${this.id}.save`;

    this.commandLifecycleFeature = new CommandLifecycleFeature({
      onAttach: () => {
        this.commandRegistry.register(this.closeCommand, () => {
          this.router?.pop?.();
        });

        this.commandRegistry.register(this.saveCommand, async (payload = {}) => {
          const formId = String(this.form?.formId || this.form?.id || '').trim();
          const createdAt = Number(this.result?.createdAt);

          if (!formId || !Number.isFinite(createdAt)) {
            this.context?.uiServices?.showToast?.('Unable to save: missing result key.');
            return;
          }

          const existingInputs = extractInputMap(this.result);
          const editedFields = mapEditorPayloadToResultFields(payload?.fields || {});
          const nextPayload = {
            ...existingInputs,
            ...editedFields
          };

          try {
            const updated = await formResultsRepository.updateResult({
              formId,
              createdAt,
              payload: nextPayload
            });

            updateResultInStore(this.store, formId, createdAt, {
              ...(this.result || {}),
              ...(updated || {}),
              payload: nextPayload,
              createdAt
            });

            if (this.result && typeof this.result === 'object') {
              this.result.payload = nextPayload;
              this.result.updatedAt = updated?.updatedAt || Date.now();
            }

            this.context?.uiServices?.showToast?.('Result updated.');
            this.router?.pop?.();
          } catch (error) {
            const message = error?.message || String(error || 'Save failed');
            this.context?.uiServices?.showToast?.(`Save failed: ${message}`);
          }
        });
      },
      onDetach: () => {
        this.commandRegistry?.unregister?.(this.closeCommand);
        this.commandRegistry?.unregister?.(this.saveCommand);
      }
    });

    this.modules = [this.commandLifecycleFeature];
    this.lifecycleModules = [this.commandLifecycleFeature];
  }

  mount() {
    const manifest = buildFormResultEditorManifest({
      form: this.form,
      result: this.result,
      resultIndex: this.resultIndex,
      resultId: this.result?.id || this.result?.resultId || this.result?.createdAt,
      closeCommand: this.closeCommand,
      saveCommand: this.saveCommand
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

function mapEditorPayloadToResultFields(fields) {
  const source = fields && typeof fields === 'object' ? fields : {};
  const next = {};

  for (const [key, value] of Object.entries(source)) {
    if (!key.startsWith('result-editor-')) continue;
    const normalizedKey = key.slice('result-editor-'.length);
    if (!normalizedKey) continue;
    next[normalizedKey] = value;
  }

  return next;
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

function updateResultInStore(store, formId, createdAt, nextResult) {
  const safeStore = store && typeof store.getState === 'function' && typeof store.apply === 'function'
    ? store
    : null;
  if (!safeStore) return;

  const state = safeStore.getState();
  const previousResults = Array.isArray(state?.results?.[formId]) ? state.results[formId] : [];
  const targetCreatedAt = Number(createdAt);

  const updatedResults = previousResults.map((item) => {
    const itemCreatedAt = Number(item?.createdAt);
    if (itemCreatedAt !== targetCreatedAt) return item;
    return {
      ...item,
      ...nextResult,
      createdAt: targetCreatedAt
    };
  });

  safeStore.apply({
    ...state,
    results: {
      ...(state?.results || {}),
      [formId]: updatedResults
    }
  });
}
