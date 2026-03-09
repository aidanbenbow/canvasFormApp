import { FORM_BUILDER_ENGINE_EVENTS } from './formBuilderEngineEvents.js';
import {
  createCommandRegistryAdapter,
  createFormModelAdapter,
  createCanvasUiRendererAdapter
} from './formBuilderAdapters.js';
import { BaseScreenEngine } from '../engines/baseScreenEngine.js';
import { EditorState } from './editorState.js';
import { getFieldPlugins } from '../fieldPlugins/fieldPluginRegistry.js';
import { CommandHost } from './hosts/commandHost.js';
import { PluginHost } from './hosts/pluginHost.js';
import { RendererHost } from './hosts/rendererHost.js';
import { ModelHost } from './hosts/modelHost.js';
import { RuntimeHost, createDefaultRuntimeFeatureFactories } from './hosts/runtimeHost.js';
import { PhotoHost } from './hosts/photoHost.js';
import { SaveFormUseCase } from './useCases/saveFormUseCase.js';
import { AddFieldUseCase } from './useCases/addFieldUseCase.js';
import { DeleteFieldUseCase } from './useCases/deleteFieldUseCase.js';
import { FieldUseCases } from './useCases/fieldUseCases.js';
import { ScreenPipeline } from './screenPipeline.js';

export class FormBuilderEngine extends BaseScreenEngine {
  constructor({
    id = 'formBuilderEngine',
    context,
    dispatcher,
    eventBusManager,
    store,
    factories,
    commandRegistry,
    modelAdapter,
    persistenceAdapter,
    commandAdapter,
    uiRendererAdapter,
    uiAdapter,
    manifestBuilder,
    displayBuilder,
    fieldFactory,
    fieldResolver,
    dragHandlePresentation,
    runtimeFeatureFactories,
    onSubmit,
    form,
    onEngineEvent
  }) {
    super({ id, context, onEngineEvent });
    this.dispatcher = dispatcher;
    this.eventBusManager = eventBusManager;
    this.store = store;
    this.factories = factories;
    this.modelAdapter = modelAdapter || createFormModelAdapter(form);
    this.persistenceAdapter = persistenceAdapter || {};
    this.commandAdapter = commandAdapter || createCommandRegistryAdapter(commandRegistry);
    this.uiRendererAdapter = uiRendererAdapter
      || uiAdapter
      || createCanvasUiRendererAdapter({ factories, commandRegistry, context });
    this.commandRegistry =
      commandRegistry || this.commandAdapter?.getCommandRegistry?.() || null;
    this.manifestBuilder = manifestBuilder;
    this.displayBuilder = displayBuilder;
    this.fieldFactory = fieldFactory;
    this.fieldResolver = fieldResolver;
    this.dragHandlePresentation = dragHandlePresentation;
    this.runtimeFeatureFactories = Array.isArray(runtimeFeatureFactories)
      ? runtimeFeatureFactories
      : createDefaultRuntimeFeatureFactories();

    this.assertRequiredStrategies();
    this.onSubmit = onSubmit;
    this.initializeEditorState(form);
    this.initializeHosts();
    this.initializeUseCases();
    this.initializeModules();
    this.initializeScreenPipeline();
  }

  initializeEditorState(form) {
    this.editorState = new EditorState({ mode: form ? 'edit' : 'create' });
    this.mode = this.editorState.getMode();
    this.unsubscribeEditorState = this.editorState.subscribe((nextState, previousState, changedKeys) => {
      this.emit(FORM_BUILDER_ENGINE_EVENTS.editorState, {
        nextState,
        previousState,
        changedKeys
      });
    });
  }

  initializeHosts() {
    this.pluginHost = new PluginHost();

    this.commandHost = new CommandHost({
      id: this.id,
      commandAdapter: this.commandAdapter,
      engine: this,
      getCommandHandlers: () => this.getCommandHandlers()
    });

    this.commands = this.commandHost.getCommands();
    this.saveCommand = this.commands.saveCommand;
    this.addTextCommand = this.commands.addTextCommand;
    this.addInputCommand = this.commands.addInputCommand;
    this.addLabelCommand = this.commands.addLabelCommand;
    this.addPhotoCommand = this.commands.addPhotoCommand;
    this.deleteFieldCommand = this.commands.deleteFieldCommand;

    this.pluginHost.registerPlugins(
      getFieldPlugins(this.editorState.getMode(), {
        saveBrightnessAction: this.commands.saveBrightnessCommand
      })
    );

    this.modelHost = new ModelHost({
      modelAdapter: this.modelAdapter,
      persistenceAdapter: this.persistenceAdapter,
      onSubmit: this.onSubmit,
      emit: (eventName, payload) => this.emit(eventName, payload),
      getMode: () => this.editorState.getMode(),
      getEngine: () => this
    });

    this.photoHost = new PhotoHost();

    this.rendererHost = new RendererHost({
      manifestBuilder: this.manifestBuilder,
      displayBuilder: this.displayBuilder,
      uiRendererAdapter: this.uiRendererAdapter,
      getEditorState: () => this.editorState.getSnapshot(),
      getFields: () => this.getNormalizedFields(),
      getPlugins: () => this.getRegisteredPlugins(),
      getDeleteFieldCommand: () => this.deleteFieldCommand,
      getDragHandlePresentation: ({ fieldId, smallScreen, previewInsertionBeforeFieldId }) =>
        this.dragHandlePresentation({
          fieldId,
          smallScreen,
          previewInsertionBeforeFieldId
        }),
      getPreviewInsertionBeforeFieldId: () => this.editorState.getPreviewInsertionBeforeFieldId(),
      getRuntimePreviewInsertionBeforeFieldId: () =>
        this.interactionController?.getPreviewInsertionBeforeFieldId?.() ??
        this.editorState.getPreviewInsertionBeforeFieldId(),
      photoHost: this.photoHost,
      getSaveBrightnessAction: () => this.runtimeHost?.getSaveBrightnessAction?.() || this.commands.saveBrightnessCommand
    });

    this.runtimeHost = new RuntimeHost({
      context: this.context,
      editorState: this.editorState,
      getRootNode: () => this.rootNode,
      getContainer: () => this.regions?.formContainer,
      getFields: () => this.getNormalizedFields(),
      getFieldById: (fieldId) => this.getFieldById(fieldId),
      fieldResolver: (payload) => this.fieldResolver(payload),
      dragHandlePresentation: ({ fieldId, smallScreen, previewInsertionBeforeFieldId }) =>
        this.dragHandlePresentation({
          fieldId,
          smallScreen,
          previewInsertionBeforeFieldId
        }),
      isPhotoLikeField: (field) => this.photoHost.isPhotoLikeField(field),
      getPhotoSource: (field) => this.photoHost.getPhotoSource(field),
      saveBrightnessAction: this.commands.saveBrightnessCommand,
      requestBrightnessPersist: (fieldId) => this.requestBrightnessPersist(fieldId),
      refreshFormContainer: () => this.rendererHost.refreshFormContainer({
        stopActiveEditing: () => this.stopActiveEditing(),
        getDisplayFields: () => this.rendererHost.getDisplayFields(),
        onRenderModulesAttached: () => {
          this.regions = this.rendererHost.getRegions() || this.regions;
          this.attachRenderModules();
        }
      }),
      reorderFields: (sourceFieldId, targetFieldId) => this.modelHost.reorderField(sourceFieldId, targetFieldId),
      featureFactories: this.runtimeFeatureFactories
    });

    this.interactionController = this.runtimeHost.interactionController;
    this.photoAdjustmentFeature = this.runtimeHost.photoAdjustmentFeature;
    this.reorderFeature = this.runtimeHost.reorderFeature;
    this.fieldBindingFeature = this.runtimeHost.fieldBindingFeature;
    this.interactionBindingFeature = this.runtimeHost.interactionBindingFeature;
    this.photoPreviewFeature = this.runtimeHost.photoPreviewFeature;
    this.commandLifecycleFeature = this.commandHost.getLifecycleFeature();
  }

  initializeUseCases() {
    this.saveFormUseCase = new SaveFormUseCase({
      requestSave: () => this.modelHost.requestSave()
    });

    this.addFieldUseCase = new AddFieldUseCase({
      fieldFactory: (type) => this.fieldFactory(type),
      getSelectedFieldId: () => this.interactionController.getSelectedFieldId(),
      getFieldById: (fieldId) => this.getFieldById(fieldId),
      addField: (field) => this.modelHost.addField(field),
      selectField: (fieldId) => this.interactionController.setSelectedField(fieldId),
      getFields: () => this.getNormalizedFields(),
      setFields: (fields) => this.setNormalizedFields(fields)
    });

    this.deleteFieldUseCase = new DeleteFieldUseCase({
      deleteField: (fieldId) => this.modelHost.deleteField(fieldId),
      getFields: () => this.getNormalizedFields(),
      getSelectedFieldId: () => this.interactionController.getSelectedFieldId(),
      selectField: (fieldId) => this.interactionController.setSelectedField(fieldId),
      refreshFormContainer: () => this.rendererHost.refreshFormContainer({
        stopActiveEditing: () => this.stopActiveEditing(),
        getDisplayFields: () => this.rendererHost.getDisplayFields(),
        onRenderModulesAttached: () => {
          this.regions = this.rendererHost.getRegions() || this.regions;
          this.attachRenderModules();
        }
      })
    });

    this.fieldUseCases = new FieldUseCases({
      addFieldUseCase: this.addFieldUseCase,
      deleteFieldUseCase: this.deleteFieldUseCase
    });
  }

  initializeModules() {
    this.modules = [
      this.commandLifecycleFeature,
      ...this.runtimeHost.getAllFeatures()
    ];

    this.lifecycleModules = [this.commandLifecycleFeature];
    this.runtimeModules = this.runtimeHost.runtimeModules;
    this.renderModules = this.runtimeHost.renderModules;
  }

  initializeScreenPipeline() {
    this.screenPipeline = new ScreenPipeline({
      enableTiming: this.shouldEnablePipelineTiming(),
      name: `${this.id}.ScreenPipeline`,
      stages: {
        buildManifest: (state) => {
          const editorState = this.editorState.getSnapshot();
          const fields = Array.isArray(state?.fields) ? state.fields : this.modelHost.getFields();
          const plugins = Array.isArray(state?.plugins) ? state.plugins : this.pluginHost.getPlugins();
          const displayFields = this.rendererHost.getDisplayFields({ fields, plugins, editorState });
          const manifest = this.rendererHost.buildScreenManifest({
            mode: this.editorState.getMode(),
            saveCommand: this.saveCommand,
            addTextCommand: this.addTextCommand,
            addLabelCommand: this.addLabelCommand,
            addInputCommand: this.addInputCommand,
            addPhotoCommand: this.addPhotoCommand,
            closeCommand: this.commands.closeCommand,
            displayFields
          });

          return { editorState, fields, plugins, displayFields, manifest };
        },
        render: (state) => {
          const rendered = this.rendererHost.renderScreen(state.manifest);
          const rootNode = rendered?.rootNode || this.rendererHost.getRootNode();
          const regions = rendered?.regions || this.rendererHost.getRegions();

          this.rootNode = rootNode;
          this.regions = regions;

          return { rendered, rootNode, regions };
        },
        attachModules: () => {
          super.mount();
          return {};
        },
        bindInteractions: () => {
          this.attachRenderModules();
          this.runtimeHost.attachRuntimeModules((modules) => this.attachModules(modules));
          return {};
        },
        finalize: (state) => {
          const screen = {
            manifest: state.manifest,
            rootNode: this.rootNode,
            regions: this.regions,
            displayFields: state.displayFields,
            editorState: state.editorState
          };

          this.screen = screen;
          this.screenManifest = state.manifest;
          return screen;
        }
      }
    });
  }

  shouldEnablePipelineTiming() {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location?.search || '');
    if (params.get('screenPipelineTiming') === '1') return true;

    const host = String(window.location?.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
  }

  assertRequiredStrategies() {
    const requiredStrategies = {
      manifestBuilder: this.manifestBuilder,
      displayBuilder: this.displayBuilder,
      fieldFactory: this.fieldFactory,
      fieldResolver: this.fieldResolver,
      dragHandlePresentation: this.dragHandlePresentation
    };

    for (const [name, strategy] of Object.entries(requiredStrategies)) {
      if (typeof strategy !== 'function') {
        throw new Error(`FormBuilderEngine requires strategy function: ${name}`);
      }
    }
  }

  getCommands() {
    return this.commandHost.getCommands();
  }

  registerPlugin(plugin) {
    this.pluginHost.registerPlugin(plugin);
  }

  registerPlugins(plugins = []) {
    this.pluginHost.registerPlugins(plugins);
  }

  unregisterPlugin(pluginName) {
    this.pluginHost.unregisterPlugin(pluginName);
  }

  clearPlugins() {
    this.pluginHost.clearPlugins();
  }

  getRegisteredPlugins() {
    return this.pluginHost.getRegisteredPlugins();
  }

  getEditorState() {
    return this.editorState.getSnapshot();
  }

  getCommandHandlers() {
    return {
      onClose: () => this.requestClose(),
      onSave: () => this.requestSave(),
      onSaveBrightness: (fieldId) => this.runtimeHost.handleSaveBrightness(fieldId),
      onAddComponent: (type) => this.fieldUseCases.add(type),
      onDeleteField: (fieldId) => this.fieldUseCases.delete(fieldId)
    };
  }

  registerCommands() {
    this.commandHost.attach();
  }

  unregisterCommands() {
    this.commandHost.detach();
  }

  requestSave() {
    this.saveFormUseCase.execute();
  }

  requestClose() {
    this.context?.screenRouter?.pop?.();
  }

  handleSaveRequest(normalizedForm) {
    this.onSubmit?.(normalizedForm);
  }

  requestBrightnessPersist(fieldId) {
    this.modelHost.requestBrightnessPersist(fieldId);
  }

  handleBrightnessPersistRequest() {}

  mount() {
    this.screen = this.screenPipeline.run({
      form: this.modelHost.getForm(),
      fields: this.modelHost.getFields(),
      plugins: this.pluginHost.getPlugins()
    });

    return this.rootNode;
  }

  refresh() {
    this.rendererHost.refreshFormContainer({
      stopActiveEditing: () => this.stopActiveEditing(),
      getDisplayFields: () => this.rendererHost.getDisplayFields(),
      onRenderModulesAttached: () => {
        this.regions = this.rendererHost.getRegions() || this.regions;
        this.attachRenderModules();
      }
    });
  }

  buildScreenManifest({ fields, plugins, editorState } = {}) {
    return this.rendererHost.buildScreenManifest({
      mode: editorState?.mode || this.editorState.getMode(),
      saveCommand: this.saveCommand,
      addTextCommand: this.addTextCommand,
      addLabelCommand: this.addLabelCommand,
      addInputCommand: this.addInputCommand,
      addPhotoCommand: this.addPhotoCommand,
      closeCommand: this.commands.closeCommand,
      displayFields: this.rendererHost.getDisplayFields({ fields, plugins, editorState })
    });
  }

  attachRenderModules() {
    this.runtimeHost.attachRenderModules((modules) => this.attachModules(modules));
  }

  getNormalizedFields() {
    return this.modelHost.getNormalizedFields();
  }

  setNormalizedFields(fields) {
    this.modelHost.setNormalizedFields(fields);
  }

  getFieldById(fieldId) {
    return this.modelHost.getFieldById(fieldId);
  }

  stopActiveEditing() {
    this.runtimeHost.stopActiveEditing();
  }

  focusFieldInputForEditing(fieldId) {
    this.runtimeHost.focusFieldInputForEditing(fieldId);
  }

  resolveFieldIdFromNode(node, { allowDeleteNode = false, allowHandleNode = true } = {}) {
    return this.runtimeHost.resolveFieldIdFromNode(node, {
      allowDeleteNode,
      allowHandleNode
    });
  }

  addComponent(type) {
    this.fieldUseCases.add(type);
  }

  deleteComponent(fieldId) {
    this.fieldUseCases.delete(fieldId);
  }

  destroy() {
    this.stopActiveEditing();
    this.runtimeHost.dispose();
    this.unsubscribeEditorState?.();
    this.unsubscribeEditorState = null;
    super.destroy();
  }
}
