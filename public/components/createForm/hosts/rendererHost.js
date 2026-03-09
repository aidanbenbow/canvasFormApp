export class RendererHost {
  constructor({
    manifestBuilder,
    displayBuilder,
    uiRendererAdapter,
    getEditorState,
    getFields,
    getPlugins,
    getDeleteFieldCommand,
    getDragHandlePresentation,
    getPreviewInsertionBeforeFieldId,
    getRuntimePreviewInsertionBeforeFieldId,
    photoHost,
    getSaveBrightnessAction
  } = {}) {
    this.manifestBuilder = manifestBuilder;
    this.displayBuilder = displayBuilder;
    this.uiRendererAdapter = uiRendererAdapter;
    this.getEditorState = getEditorState;
    this.getFields = getFields;
    this.getPlugins = getPlugins;
    this.getDeleteFieldCommand = getDeleteFieldCommand;
    this.getDragHandlePresentation = getDragHandlePresentation;
    this.getPreviewInsertionBeforeFieldId = getPreviewInsertionBeforeFieldId;
    this.getRuntimePreviewInsertionBeforeFieldId = getRuntimePreviewInsertionBeforeFieldId;
    this.photoHost = photoHost;
    this.getSaveBrightnessAction = getSaveBrightnessAction;
    this.screenManifest = null;
  }

  buildScreenManifest({ mode,closeCommand, saveCommand, addTextCommand, addLabelCommand, addInputCommand, addPhotoCommand, displayFields }) {
    return this.manifestBuilder({
      mode,
        closeCommand,
      saveCommand,
      addTextCommand,
      addLabelCommand,
      addInputCommand,
      addPhotoCommand,
      displayFields
    });
  }

  renderScreen(manifest) {
    this.screenManifest = manifest;
    return this.uiRendererAdapter.renderManifest(manifest);
  }

  buildDisplayFields({ fields, editorState, plugins, pluginContext, deleteFieldCommand, getDragHandlePresentation, isPhotoLikeField, getPhotoSource, saveBrightnessAction }) {
    return this.displayBuilder({
      fields,
      editorState,
      plugins,
      pluginContext,
      deleteFieldCommand,
      getDragHandlePresentation,
      isPhotoLikeField,
      getPhotoSource,
      saveBrightnessAction
    });
  }

  getDisplayFields({ fields, plugins, editorState } = {}) {
    const resolvedEditorState = editorState || this.getEditorState?.();
    const resolvedFields = Array.isArray(fields) ? fields : (this.getFields?.() || []);
    const resolvedPlugins = Array.isArray(plugins) ? plugins : (this.getPlugins?.() || []);
    const deleteFieldCommand = this.getDeleteFieldCommand?.();
    const saveBrightnessAction = this.getSaveBrightnessAction?.();

    const pluginContext = {
      mode: resolvedEditorState?.mode,
      selectedFieldId: resolvedEditorState?.selectedFieldId,
      draggingFieldId: resolvedEditorState?.draggingFieldId,
      deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) =>
        this.getDragHandlePresentation?.({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.getPreviewInsertionBeforeFieldId?.()
        }),
      isPhotoLikeField: (field) => this.photoHost?.isPhotoLikeField?.(field),
      getPhotoSource: (field) => this.photoHost?.getPhotoSource?.(field),
      saveBrightnessAction
    };

    return this.buildDisplayFields({
      fields: resolvedFields,
      editorState: resolvedEditorState,
      plugins: resolvedPlugins,
      pluginContext,
      deleteFieldCommand,
      getDragHandlePresentation: (fieldId, options) =>
        this.getDragHandlePresentation?.({
          fieldId,
          smallScreen: options?.smallScreen,
          previewInsertionBeforeFieldId: this.getRuntimePreviewInsertionBeforeFieldId?.()
        }),
      isPhotoLikeField: (field) => this.photoHost?.isPhotoLikeField?.(field),
      getPhotoSource: (field) => this.photoHost?.getPhotoSource?.(field),
      saveBrightnessAction
    });
  }

  refreshFormContainer({ stopActiveEditing, getDisplayFields, onRenderModulesAttached }) {
    const regions = this.uiRendererAdapter.getRegions?.();
    if (!regions?.formContainer) return;

    const displayFields = typeof getDisplayFields === 'function'
      ? getDisplayFields()
      : [];

    stopActiveEditing?.();
    this.uiRendererAdapter.updateRegion('formContainer', displayFields);
    onRenderModulesAttached?.();
    this.uiRendererAdapter.invalidate?.();
  }

  getRootNode() {
    return this.uiRendererAdapter.getRootNode?.() || null;
  }

  getRegions() {
    return this.uiRendererAdapter.getRegions?.() || null;
  }
}
