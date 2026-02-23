import { FormBuilderFieldBindingController } from '../../controllers/formBuilderFieldBindingController.js';
import { FormBuilderInteractionController } from '../../controllers/formBuilderInteractionController.js';
import { getPhotoSource, isPhotoLikeField } from '../../utils/fieldGuards.js';
import {
  buildCreateFormCommandNames
} from './createFormCommands.js';
import {
  focusCreateFormFieldInputForEditing,
  stopCreateFormActiveEditing
} from './createFormEditorInteraction.js';
import { PhotoAdjustmentFeature } from './photoAdjustmentFeature.js';
import { ReorderFeature } from './reorderFeature.js';
import {
  createCommandRegistryAdapter,
  createFormModelAdapter,
  createCanvasUiRendererAdapter
} from './formBuilderAdapters.js';
import { EditorState } from './editorState.js';
import { getFieldPlugins } from '../fieldPlugins/fieldPluginRegistry.js';

export class FormBuilderEngine {
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
    onSubmit,
    form,
    onEngineEvent
  }) {
    this.id = id;
    this.dispatcher = dispatcher;
    this.eventBusManager = eventBusManager;
    this.rootNode = null;
    this.regions = null;
    this.store = store;
    this.context = context;
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

    this.assertRequiredStrategies();
    this.onSubmit = onSubmit;
    this.onEngineEvent = onEngineEvent;
    this.eventListeners = new Map();
    this.plugins = [];
    this.editorState = new EditorState({ mode: form ? 'edit' : 'create' });
    this.mode = this.editorState.getMode();
    this.unsubscribeEditorState = this.editorState.subscribe((nextState, previousState, changedKeys) => {
      this.emit('editor:state', {
        nextState,
        previousState,
        changedKeys
      });
    });

    this.commands = buildCreateFormCommandNames(this.id);
    this.saveCommand = this.commands.saveCommand;
    this.addTextCommand = this.commands.addTextCommand;
    this.addInputCommand = this.commands.addInputCommand;
    this.addLabelCommand = this.commands.addLabelCommand;
    this.addPhotoCommand = this.commands.addPhotoCommand;
    this.deleteFieldCommand = this.commands.deleteFieldCommand;

    this.registerPlugins(
      getFieldPlugins(this.editorState.getMode(), {
        saveBrightnessAction: this.commands.saveBrightnessCommand
      })
    );

    this.photoAdjustmentFeature = new PhotoAdjustmentFeature({
      context: this.context,
      getFieldById: (fieldId) => this.getFieldById(fieldId),
      onBrightnessCommitted: (fieldId) => this.requestBrightnessPersist(fieldId),
      onSelectField: (fieldId) => this.interactionController.setSelectedField(fieldId),
      onFocusField: (fieldId) => this.focusFieldInputForEditing(fieldId),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      saveBrightnessAction: this.commands.saveBrightnessCommand
    });

    this.fieldBindingController = new FormBuilderFieldBindingController({
      getFields: () => this.getNormalizedFields(),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      updatePhotoPreview: (fieldId, source) => this.photoAdjustmentFeature.updatePreviewForField(fieldId, source),
      onPhotoPreviewCreated: (fieldId) => this.photoAdjustmentFeature.onPhotoPreviewCreated(fieldId)
    });

    this.interactionController = new FormBuilderInteractionController({
      context: this.context,
      editorState: this.editorState,
      getRootNode: () => this.rootNode,
      getFieldIds: () => this.getNormalizedFields().map((field) => field.id),
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      getDragHandlePresentation: (fieldId, options) =>
        this.dragHandlePresentation({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.interactionController.getPreviewInsertionBeforeFieldId()
        }),
      isSmallScreen: () => typeof window !== 'undefined' && window.innerWidth < 1024,
      stopActiveEditing: () => this.stopActiveEditing(),
      refreshFormContainer: () => this.refreshFormContainer(),
      onPhotoPreviewSelected: (fieldId) => this.photoAdjustmentFeature.onPhotoPreviewSelected(fieldId)
    });

    this.reorderFeature = new ReorderFeature({
      context: this.context,
      dragThreshold: 8,
      editorState: this.editorState,
      getRootNode: () => this.rootNode,
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      reorderFields: (sourceFieldId, targetFieldId) => this.modelAdapter.reorderField(sourceFieldId, targetFieldId),
      stopActiveEditing: () => this.stopActiveEditing(),
      applyPreviewVisuals: () => this.interactionController.applyPreviewVisuals(),
      refreshFormContainer: () => this.refreshFormContainer(),
    });
  }

  on(eventName, handler) {
    if (!eventName || typeof handler !== 'function') return () => {};
    const listeners = this.eventListeners.get(eventName) || new Set();
    listeners.add(handler);
    this.eventListeners.set(eventName, listeners);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const listeners = this.eventListeners.get(eventName);
    if (!listeners) return;
    listeners.delete(handler);
    if (!listeners.size) this.eventListeners.delete(eventName);
  }

  emit(eventName, payload) {
    const listeners = this.eventListeners.get(eventName);
    if (!listeners?.size) return;
    for (const handler of listeners) {
      handler(payload);
    }
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
    return { ...this.commands };
  }

  registerPlugin(plugin) {
    if (!plugin || typeof plugin !== 'object') return;
    if (!plugin.name || typeof plugin.name !== 'string') return;
    if (typeof plugin.transform !== 'function' && typeof plugin.transformFields !== 'function') return;

    const existingIndex = this.plugins.findIndex((entry) => entry?.name === plugin.name);
    if (existingIndex >= 0) {
      this.plugins[existingIndex] = plugin;
      return;
    }

    this.plugins.push(plugin);
  }

  registerPlugins(plugins = []) {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  unregisterPlugin(pluginName) {
    if (!pluginName) return;
    this.plugins = this.plugins.filter((plugin) => plugin?.name !== pluginName);
  }

  clearPlugins() {
    this.plugins = [];
  }

  getRegisteredPlugins() {
    return [...this.plugins];
  }

  getEditorState() {
    return this.editorState.getSnapshot();
  }

  getCommandHandlers() {
    return {
      onSave: () => this.requestSave(),
      onSaveBrightness: (fieldId) => this.photoAdjustmentFeature.handleSaveBrightness(fieldId),
      onAddComponent: (type) => this.addComponent(type),
      onDeleteField: (fieldId) => this.deleteComponent(fieldId)
    };
  }

  registerCommands() {
    this.commandAdapter?.registerCommands?.({
      commands: this.getCommands(),
      handlers: this.getCommandHandlers(),
      engine: this
    });
  }

  unregisterCommands() {
    this.commandAdapter?.unregisterCommands?.({
      commands: this.getCommands(),
      engine: this
    });
  }

  emitEngineEvent(type, payload) {
    this.onEngineEvent?.({ type, payload });
  }

  requestSave() {
    const normalizedForm = this.modelAdapter.normalize();
    this.emit('form:save', normalizedForm);
    this.emitEngineEvent('saveRequested', { form: normalizedForm });
    const hasPersistenceAdapter = typeof this.persistenceAdapter?.onSave === 'function';
    this.persistenceAdapter?.onSave?.(normalizedForm, {
      mode: this.editorState.getMode(),
      engine: this
    });
    if (!hasPersistenceAdapter) {
      this.handleSaveRequest(normalizedForm);
    }
  }

  handleSaveRequest(normalizedForm) {
    this.onSubmit?.(normalizedForm);
  }

  requestBrightnessPersist(fieldId) {
    const normalizedForm = this.modelAdapter.normalize();
    this.emit('form:update', normalizedForm);
    this.emitEngineEvent('brightnessPersistRequested', { fieldId, form: normalizedForm });
    const hasPersistenceAdapter = typeof this.persistenceAdapter?.onUpdate === 'function';
    this.persistenceAdapter?.onUpdate?.(normalizedForm, {
      mode: this.editorState.getMode(),
      reason: 'brightness',
      fieldId,
      engine: this
    });
    if (!hasPersistenceAdapter) {
      this.handleBrightnessPersistRequest({ fieldId, normalizedForm });
    }
  }

  handleBrightnessPersistRequest() {}

  mount() {
    this.screenManifest = this.buildScreenManifest();
    const rendered = this.uiRendererAdapter.renderManifest(this.screenManifest);

    this.rootNode = rendered?.rootNode || this.uiRendererAdapter.getRootNode?.() || null;
    this.regions = rendered?.regions || this.uiRendererAdapter.getRegions?.() || null;
    this.rebindAfterRender();
    this.attachFeatures();

    return this.rootNode;
  }

  refresh() {
    this.refreshFormContainer();
  }

  attachFeatures() {
    this.reorderFeature.attach();
  }

  detachFeatures() {
    this.reorderFeature.detach();
  }

  buildScreenManifest() {
    return this.manifestBuilder({
      mode: this.editorState.getMode(),
      saveCommand: this.saveCommand,
      addTextCommand: this.addTextCommand,
      addLabelCommand: this.addLabelCommand,
      addInputCommand: this.addInputCommand,
      addPhotoCommand: this.addPhotoCommand,
      displayFields: this.getDisplayFields()
    });
  }

  getDisplayFields() {
    const editorState = this.editorState.getSnapshot();
    const pluginContext = {
      mode: editorState.mode,
      selectedFieldId: editorState.selectedFieldId,
      draggingFieldId: editorState.draggingFieldId,
      deleteFieldCommand: this.deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) =>
        this.dragHandlePresentation({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.editorState.getPreviewInsertionBeforeFieldId()
        }),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      saveBrightnessAction: this.photoAdjustmentFeature.getSaveBrightnessAction()
    };

    return this.displayBuilder({
      fields: this.getNormalizedFields(),
      editorState,
      plugins: this.getRegisteredPlugins(),
      pluginContext,
      deleteFieldCommand: this.deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) =>
        this.dragHandlePresentation({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.interactionController.getPreviewInsertionBeforeFieldId()
        }),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      saveBrightnessAction: this.photoAdjustmentFeature.getSaveBrightnessAction()
    });
  }

  refreshFormContainer() {
    if (!this.regions?.formContainer) return;
    this.stopActiveEditing();
    this.uiRendererAdapter.updateRegion('formContainer', this.getDisplayFields());
    this.regions = this.uiRendererAdapter.getRegions?.() || this.regions;
    this.rebindAfterRender();
    this.uiRendererAdapter.invalidate();
  }

  rebindAfterRender() {
    if (!this.regions?.formContainer) return;
    this.interactionController.bindSelectionHandlers(this.regions.formContainer);
    this.fieldBindingController.bindEditableNodes(this.regions.formContainer);
    this.bindPhotoPreviewHandlers();
    this.interactionController.cacheNodes(this.regions.formContainer);
    this.interactionController.applyPreviewVisuals();
  }

  getPhotoSource(field) {
    return getPhotoSource(field);
  }

  isPhotoLikeField(field) {
    return isPhotoLikeField(field);
  }

  bindPhotoPreviewHandlers() {
    this.photoAdjustmentFeature.bind(this.getNormalizedFields());
  }

  getNormalizedFields() {
    return this.modelAdapter.getFields();
  }

  setNormalizedFields(fields) {
    this.modelAdapter.setFields(fields);
  }

  getFieldById(fieldId) {
    if (!fieldId) return null;
    if (typeof this.modelAdapter.getFieldById === 'function') {
      return this.modelAdapter.getFieldById(fieldId);
    }
    return this.getNormalizedFields().find((field) => field?.id === fieldId) ?? null;
  }

  stopActiveEditing() {
    stopCreateFormActiveEditing(this.context);
  }

  focusFieldInputForEditing(fieldId) {
    focusCreateFormFieldInputForEditing({
      context: this.context,
      rootNode: this.rootNode,
      fieldId
    });
  }

  resolveFieldIdFromNode(node, { allowDeleteNode = false, allowHandleNode = true } = {}) {
    return this.fieldResolver({
      node,
      fields: this.getNormalizedFields(),
      allowDeleteNode,
      allowHandleNode
    });
  }

  addComponent(type) {
    const newField = this.fieldFactory(type);
    this.modelAdapter.addField(newField);
    this.interactionController.setSelectedField(newField.id);
  }

  deleteComponent(fieldId) {
    if (!fieldId) return;
    this.modelAdapter.deleteField(fieldId);
    const fields = this.getNormalizedFields();
    if (this.interactionController.getSelectedFieldId() === fieldId) {
      this.interactionController.setSelectedField(fields[0]?.id ?? null);
      return;
    }
    this.refreshFormContainer();
  }

  destroy() {
    this.stopActiveEditing();
    this.interactionController.resetAllState();
    this.interactionController.dispose?.();
    this.unsubscribeEditorState?.();
    this.unsubscribeEditorState = null;
    this.unregisterCommands();
    this.detachFeatures();
  }
}
