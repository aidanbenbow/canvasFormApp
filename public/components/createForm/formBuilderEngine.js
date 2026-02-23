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
  createUiAdapter
} from './formBuilderAdapters.js';
import { getCreateFormDragHandlePresentation } from './createFormDragHandlePresentation.js';
import { resolveCreateFormFieldIdFromNode } from './createFormFieldResolver.js';
import { buildDefaultCreateFormField } from './createFormFieldFactory.js';
import {
  buildCreateDisplayFields,
  buildCreateFormManifest
} from '../manifests/createFormManifest.js';
import { BaseScreen } from '../baseScreen.js';
import { compileUIManifest } from '../uiManifestCompiler.js';

export class FormBuilderEngine extends BaseScreen {
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
    uiAdapter,
    onSubmit,
    form,
    onEngineEvent
  }) {
    super({ id, context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.factories = factories;
    this.modelAdapter = modelAdapter || createFormModelAdapter(form);
    this.persistenceAdapter = persistenceAdapter || {};
    this.commandAdapter = commandAdapter || createCommandRegistryAdapter(commandRegistry);
    this.uiAdapter = uiAdapter || createUiAdapter(factories);
    this.commandRegistry =
      commandRegistry || this.commandAdapter?.getCommandRegistry?.() || null;
    this.onSubmit = onSubmit;
    this.onEngineEvent = onEngineEvent;
    this.eventListeners = new Map();
    this.mode = form ? 'edit' : 'create';

    this.commands = buildCreateFormCommandNames(this.id);
    this.saveCommand = this.commands.saveCommand;
    this.addTextCommand = this.commands.addTextCommand;
    this.addInputCommand = this.commands.addInputCommand;
    this.addLabelCommand = this.commands.addLabelCommand;
    this.addPhotoCommand = this.commands.addPhotoCommand;
    this.deleteFieldCommand = this.commands.deleteFieldCommand;

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
      getRootNode: () => this.rootNode,
      getFieldIds: () => this.getNormalizedFields().map((field) => field.id),
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      getDragHandlePresentation: (fieldId, options) =>
        getCreateFormDragHandlePresentation({
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
      getRootNode: () => this.rootNode,
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      reorderFields: (sourceFieldId, targetFieldId) => this.modelAdapter.reorderField(sourceFieldId, targetFieldId),
      clearDragPreviewState: () => this.interactionController.clearDragPreviewState(),
      refreshFormContainer: () => this.refreshFormContainer(),
      onPreviewTargetChange: (fieldId) => this.interactionController.setPreviewInsertion(fieldId),
      onDragStateChange: ({ active, sourceFieldId }) => this.interactionController.setDraggingState(active, sourceFieldId)
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

  getCommands() {
    return { ...this.commands };
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
    this.persistenceAdapter?.onSave?.(normalizedForm, { mode: this.mode, engine: this });
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
      mode: this.mode,
      reason: 'brightness',
      fieldId,
      engine: this
    });
    if (!hasPersistenceAdapter) {
      this.handleBrightnessPersistRequest({ fieldId, normalizedForm });
    }
  }

  handleBrightnessPersistRequest() {}

  createRoot() {
    this.screenManifest = this.buildScreenManifest();
    const { rootNode, regions } = compileUIManifest(
      this.screenManifest,
      this.factories,
      this.commandRegistry,
      this.context
    );

    this.rootNode = rootNode;
    this.regions = regions;
    this.rebindAfterRender();
    this.reorderFeature.attach();

    return rootNode;
  }

  buildScreenManifest() {
    return buildCreateFormManifest({
      mode: this.mode,
      saveCommand: this.saveCommand,
      addTextCommand: this.addTextCommand,
      addLabelCommand: this.addLabelCommand,
      addInputCommand: this.addInputCommand,
      addPhotoCommand: this.addPhotoCommand,
      displayFields: this.getDisplayFields()
    });
  }

  getDisplayFields() {
    const editorState = {
      mode: this.mode,
      selectedFieldId: this.interactionController.getSelectedFieldId(),
      draggingFieldId: this.interactionController.getDraggingFieldId()
    };

    return buildCreateDisplayFields({
      fields: this.getNormalizedFields(),
      editorState,
      deleteFieldCommand: this.deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) =>
        getCreateFormDragHandlePresentation({
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
    const nodes = this.getDisplayFields().map((def) => this.uiAdapter.createNode(def));
    this.regions.formContainer.setChildren(nodes);
    this.rebindAfterRender();
    this.uiAdapter.invalidateRoot(this.rootNode);
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
    return resolveCreateFormFieldIdFromNode({
      node,
      fields: this.getNormalizedFields(),
      allowDeleteNode,
      allowHandleNode
    });
  }

  addComponent(type) {
    const newField = buildDefaultCreateFormField(type);
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

  onExit() {
    this.stopActiveEditing();
    this.interactionController.resetAllState();
    this.unregisterCommands();
    this.reorderFeature.detach();
  }
}
