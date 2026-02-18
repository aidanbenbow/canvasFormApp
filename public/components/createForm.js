import { ACTIONS } from '../events/actions.js';
import { saveFormStructure } from '../controllers/socketController.js';
import { FormBuilderFieldBindingController } from '../controllers/formBuilderFieldBindingController.js';
import { FormBuilderInteractionController } from '../controllers/formBuilderInteractionController.js';
import { FormReorderController } from '../controllers/formReorderController.js';
import { PhotoPreviewController } from '../controllers/photoPreviewController.js';
import { FormModel } from '../models/formModel.js';
import { getPhotoSource, isPhotoLikeField } from '../utils/fieldGuards.js';
import {
  buildCreateFormCommandNames,
  registerCreateFormCommands
} from './createForm/createFormCommands.js';
import {
  focusCreateFormFieldInputForEditing,
  stopCreateFormActiveEditing
} from './createForm/createFormEditorInteraction.js';
import { getCreateFormDragHandlePresentation } from './createForm/createFormDragHandlePresentation.js';
import { resolveCreateFormFieldIdFromNode } from './createForm/createFormFieldResolver.js';
import { buildDefaultCreateFormField } from './createForm/createFormFieldFactory.js';
import { bindCreateFormPhotoPreviewHandlers } from './createForm/createFormPhotoPreviewBinder.js';
import {
  buildCreateDisplayFields,
  buildCreateFormManifest
} from './manifests/createFormManifest.js';
import { BaseScreen } from './baseScreen.js';
import { compileUIManifest } from './uiManifestCompiler.js';

export class CreateForm extends BaseScreen {
  constructor({ id='createForm', context, dispatcher, eventBusManager, store, factories, commandRegistry, onSubmit, form }) {
    super({ id, context, dispatcher, eventBusManager });
    this.store = store;
    this.context = context;
    this.factories = factories;
    this.commandRegistry = commandRegistry;
    this.onSubmit = onSubmit;
    this.mode = form ? 'edit' : 'create';

    this.formModel = new FormModel(form);
    this.form = this.formModel.getForm();

    const commands = buildCreateFormCommandNames(this.id);
    this.saveCommand = commands.saveCommand;
    this.saveBrightnessCommand = commands.saveBrightnessCommand;
    this.addTextCommand = commands.addTextCommand;
    this.addInputCommand = commands.addInputCommand;
    this.addLabelCommand = commands.addLabelCommand;
    this.addPhotoCommand = commands.addPhotoCommand;
    this.deleteFieldCommand = commands.deleteFieldCommand;

    registerCreateFormCommands({
      commandRegistry: this.commandRegistry,
      commands,
      handlers: {
        onSave: () => this.handleSubmit(),
        onSaveBrightness: (fieldId) => this.photoPreviewController.commitBrightness(fieldId),
        onAddComponent: (type) => this.addComponent(type),
        onDeleteField: (fieldId) => this.deleteComponent(fieldId)
      }
    });

    this.photoPreviewController = new PhotoPreviewController({
      context: this.context,
      onBrightnessCommitted: () => this.persistBrightnessMetadata()
    });
    this.fieldBindingController = new FormBuilderFieldBindingController({
      getFields: () => this.getNormalizedFields(),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      updatePhotoPreview: (fieldId, source) => this.photoPreviewController.updatePreviewForField(fieldId, source),
      onPhotoPreviewCreated: (fieldId) => this.interactionController.setSelectedField(fieldId)
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
      onPhotoPreviewSelected: (fieldId) => {
        this.photoPreviewController.showBrightnessControl(fieldId);
        this.focusFieldInputForEditing(fieldId);
      }
    });

    this.reorderController = new FormReorderController({
      context: this.context,
      dragThreshold: 8,
      getRootNode: () => this.rootNode,
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      onReorder: (sourceFieldId, targetFieldId) => this.reorderField(sourceFieldId, targetFieldId),
      onPreviewTargetChange: (fieldId) => this.interactionController.setPreviewInsertion(fieldId),
      onDragStateChange: ({ active, sourceFieldId }) => this.interactionController.setDraggingState(active, sourceFieldId)
    });
  }

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
    this.interactionController.bindSelectionHandlers(this.regions?.formContainer);
    this.fieldBindingController.bindEditableNodes(this.regions?.formContainer);
    this.bindPhotoPreviewHandlers();
    this.interactionController.cacheNodes(this.regions?.formContainer);
    this.interactionController.applyPreviewVisuals();
    this.reorderController.attach();

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
    return buildCreateDisplayFields({
      fields: this.getNormalizedFields(),
      mode: this.mode,
      selectedFieldId: this.interactionController.getSelectedFieldId(),
      draggingFieldId: this.interactionController.getDraggingFieldId(),
      deleteFieldCommand: this.deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) =>
        getCreateFormDragHandlePresentation({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.interactionController.getPreviewInsertionBeforeFieldId()
        }),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field),
      saveBrightnessAction: this.saveBrightnessCommand
    });
  }

  refreshFormContainer() {
    if (!this.regions?.formContainer) return;
    this.stopActiveEditing();
    const nodes = this.getDisplayFields().map((def) => this.factories.basic.create(def));
    this.regions.formContainer.setChildren(nodes);
    this.interactionController.bindSelectionHandlers(this.regions.formContainer);
    this.fieldBindingController.bindEditableNodes(this.regions.formContainer);
    this.bindPhotoPreviewHandlers();
    this.interactionController.cacheNodes(this.regions.formContainer);
    this.interactionController.applyPreviewVisuals();
    this.rootNode.invalidate();
  }

  getPhotoSource(field) {
    return getPhotoSource(field);
  }

  isPhotoLikeField(field) {
    return isPhotoLikeField(field);
  }

  bindPhotoPreviewHandlers() {
    bindCreateFormPhotoPreviewHandlers({
      photoPreviewController: this.photoPreviewController,
      fields: this.getNormalizedFields(),
      isPhotoLikeField: (field) => this.isPhotoLikeField(field),
      getPhotoSource: (field) => this.getPhotoSource(field)
    });
  }

  getNormalizedFields() {
    return this.formModel.getFields();
  }

  setNormalizedFields(fields) {
    this.formModel.setFields(fields);
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

  reorderField(sourceFieldId, targetFieldId) {
    this.formModel.reorderField(sourceFieldId, targetFieldId);
    this.interactionController.clearDragPreviewState();
    this.refreshFormContainer();
  }

  addComponent(type) {
    const newField = buildDefaultCreateFormField(type);
    this.formModel.addField(newField);
    this.interactionController.setSelectedField(newField.id);
  }
  deleteComponent(fieldId) {
    if (!fieldId) return;
    this.formModel.deleteField(fieldId);
    const fields = this.getNormalizedFields();
    if (this.interactionController.getSelectedFieldId() === fieldId) {
      this.interactionController.setSelectedField(fields[0]?.id ?? null);
      return;
    }
    this.refreshFormContainer();
  }
  handleSubmit() {
    const normalizedForm = this.formModel.normalize();

    this.onSubmit?.(normalizedForm);
    this.dispatcher.dispatch(
      ACTIONS.FORM.ADD,
      normalizedForm
    );
  }

  persistBrightnessMetadata() {
    const normalizedForm = this.formModel.normalize();

    this.dispatcher.dispatch(ACTIONS.FORM.UPDATE, normalizedForm);
    saveFormStructure({
      id: normalizedForm.id,
      formStructure: normalizedForm.formStructure,
      label: normalizedForm.label,
      user: normalizedForm.user
    });
  }

  onExit() {
    this.stopActiveEditing();
    this.interactionController.resetAllState();
    this.reorderController.detach();
  }
}
