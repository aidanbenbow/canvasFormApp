export class RendererHost {
  constructor({ manifestBuilder, displayBuilder, uiRendererAdapter } = {}) {
    this.manifestBuilder = manifestBuilder;
    this.displayBuilder = displayBuilder;
    this.uiRendererAdapter = uiRendererAdapter;
    this.screenManifest = null;
  }

  buildScreenManifest({ mode, saveCommand, addTextCommand, addLabelCommand, addInputCommand, addPhotoCommand, displayFields }) {
    return this.manifestBuilder({
      mode,
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

  refreshFormContainer({ stopActiveEditing, displayFields, onRenderModulesAttached }) {
    const regions = this.uiRendererAdapter.getRegions?.();
    if (!regions?.formContainer) return;

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
