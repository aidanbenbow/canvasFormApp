import { FormBuilderFieldBindingController } from '../../../controllers/formBuilderFieldBindingController.js';
import { FormBuilderInteractionController } from '../../../controllers/formBuilderInteractionController.js';
import {
  focusCreateFormFieldInputForEditing,
  stopCreateFormActiveEditing
} from '../createFormEditorInteraction.js';
import { PhotoAdjustmentFeature } from '../photoAdjustmentFeature.js';
import { ReorderFeature } from '../reorderFeature.js';
import { FieldBindingFeature } from '../features/fieldBindingFeature.js';
import { InteractionBindingFeature } from '../features/interactionBindingFeature.js';
import { PhotoPreviewFeature } from '../features/photoPreviewFeature.js';
import { FeatureRegistry } from '../features/featureRegistry.js';

export class RuntimeHost {
  constructor({
    context,
    editorState,
    getRootNode,
    getContainer,
    getFields,
    getFieldById,
    fieldResolver,
    dragHandlePresentation,
    isPhotoLikeField,
    getPhotoSource,
    saveBrightnessAction,
    requestBrightnessPersist,
    refreshFormContainer,
    reorderFields,
    featureFactories
  } = {}) {
    this.context = context;
    this.getRootNode = getRootNode;
    this.getFields = getFields;
    this.fieldResolver = fieldResolver;
    this.featureRegistry = new FeatureRegistry();

    this.photoAdjustmentFeature = new PhotoAdjustmentFeature({
      context,
      getFieldById,
      onBrightnessCommitted: (fieldId) => requestBrightnessPersist?.(fieldId),
      onSelectField: (fieldId) => this.interactionController.setSelectedField(fieldId),
      onFocusField: (fieldId) => this.focusFieldInputForEditing(fieldId),
      isPhotoLikeField,
      getPhotoSource,
      saveBrightnessAction
    });

    this.fieldBindingController = new FormBuilderFieldBindingController({
      getFields,
      isPhotoLikeField,
      getPhotoSource,
      updatePhotoPreview: (fieldId, source) => this.photoAdjustmentFeature.updatePreviewForField(fieldId, source),
      onPhotoPreviewCreated: (fieldId) => this.photoAdjustmentFeature.onPhotoPreviewCreated(fieldId)
    });

    this.interactionController = new FormBuilderInteractionController({
      context,
      editorState,
      getRootNode,
      getFieldIds: () => getFields().map((field) => field.id),
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      getDragHandlePresentation: (fieldId, options) =>
        dragHandlePresentation({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.interactionController.getPreviewInsertionBeforeFieldId()
        }),
      isSmallScreen: () => typeof window !== 'undefined' && window.innerWidth < 1024,
      stopActiveEditing: () => this.stopActiveEditing(),
      refreshFormContainer
    });

    const runtimeContext = {
      context,
      editorState,
      getRootNode,
      getContainer,
      getFields,
      getFieldById,
      resolveFieldIdFromNode: (node, options) => this.resolveFieldIdFromNode(node, options),
      resolveFieldGroupIdFromNode: (node) => this.resolveFieldGroupIdFromNode(node),
      reorderFields,
      dragHandlePresentation,
      isPhotoLikeField,
      getPhotoSource,
      saveBrightnessAction,
      requestBrightnessPersist,
      refreshFormContainer,
      host: this
    };

    const resolvedFactories = Array.isArray(featureFactories) && featureFactories.length
      ? featureFactories
      : createDefaultRuntimeFeatureFactories();

    for (const createFeature of resolvedFactories) {
      if (typeof createFeature !== 'function') continue;
      const entry = createFeature(runtimeContext);
      if (!entry) continue;

      const feature = entry?.feature || entry;
      if (!feature || typeof feature !== 'object') continue;

      const key = typeof entry?.key === 'string' ? entry.key : null;
      if (key) {
        this[key] = feature;
      }

      this.featureRegistry.register(feature);
    }

    this.runtimeModules = this.featureRegistry.getRuntimeFeatures();
    this.renderModules = this.featureRegistry.getRenderFeatures();
  }

  stopActiveEditing() {
    stopCreateFormActiveEditing(this.context);
  }

  focusFieldInputForEditing(fieldId) {
    focusCreateFormFieldInputForEditing({
      context: this.context,
      rootNode: this.getRootNode?.(),
      fieldId
    });
  }

  getSaveBrightnessAction() {
    return this.photoAdjustmentFeature.getSaveBrightnessAction();
  }

  handleSaveBrightness(fieldId) {
    this.photoAdjustmentFeature.handleSaveBrightness(fieldId);
  }

  attachRenderModules(attachModules) {
    const modules = this.featureRegistry.getRenderFeatures();
    attachModules(modules);
    this.featureRegistry.runRenderHooks({ modules });
  }

  attachRuntimeModules(attachModules) {
    const modules = this.featureRegistry.getRuntimeFeatures();
    attachModules(modules);
    this.featureRegistry.runRuntimeHooks({ modules });
  }

  getAllFeatures() {
    return this.featureRegistry.getFeatures();
  }

  resolveFieldIdFromNode(node, { allowDeleteNode = false, allowHandleNode = true } = {}) {
    return this.fieldResolver?.({
      node,
      fields: this.getFields?.() || [],
      allowDeleteNode,
      allowHandleNode
    });
  }

  resolveFieldGroupIdFromNode(node) {
    const fieldIds = new Set((this.getFields?.() || []).map((field) => field?.id).filter(Boolean));
    let current = node;

    while (current) {
      const id = current?.id;
      if (typeof id === 'string' && fieldIds.has(id)) return id;
      current = current.parent;
    }

    return null;
  }

  dispose() {
    this.interactionController.resetAllState();
    this.interactionController.dispose?.();
  }
}

export function createDefaultRuntimeFeatureFactories() {
  return [
    ({ host }) => ({ key: 'photoAdjustmentFeature', feature: host.photoAdjustmentFeature }),
    ({
      context,
      editorState,
      getContainer,
      getRootNode,
      resolveFieldGroupIdFromNode,
      reorderFields,
      refreshFormContainer,
      host
    }) => ({
      key: 'reorderFeature',
      feature: new ReorderFeature({
        context,
        dragThreshold: 8,
        getContainer,
        editorState,
        getRootNode,
        resolveFieldGroupIdFromNode,
        reorderFields,
        stopActiveEditing: () => host.stopActiveEditing(),
        applyPreviewVisuals: () => host.interactionController.applyPreviewVisuals(),
        refreshFormContainer
      })
    }),
    ({ getContainer, host }) => ({
      key: 'fieldBindingFeature',
      feature: new FieldBindingFeature({
        getContainer,
        fieldBindingController: host.fieldBindingController
      })
    }),
    ({ getContainer, host }) => ({
      key: 'interactionBindingFeature',
      feature: new InteractionBindingFeature({
        getContainer,
        interactionController: host.interactionController
      })
    }),
    ({ getContainer, getFields, getFieldById, host }) => ({
      key: 'photoPreviewFeature',
      feature: new PhotoPreviewFeature({
        getContainer,
        getFields,
        getFieldById,
        interactionController: host.interactionController,
        photoAdjustmentFeature: host.photoAdjustmentFeature
      })
    })
  ];
}
